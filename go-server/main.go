package main

import (
	"context"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ── Data types ────────────────────────────────────────────────────────────────

type SameAs struct {
	URL   string
	Label string
}

type Occupation struct {
	Name         string
	Organization string
	StartDate    string
	EndDate      string
	Description  string
}

type Education struct {
	Name   string
	Degree string
	EndDate string
	URL    string
}

type Credential struct {
	Name       string
	IssuedBy   string
	DateIssued string
	URL        string
}

type Award struct {
	Name     string
	IssuedBy string
	Date     string
	URL      string
}

type KnowsAbout struct {
	Topic string
	Level string
}

type Review struct {
	Author        string
	ReviewBody    string
	DatePublished string
	IsTestimonial bool
}

type Person struct {
	Name        string
	JobTitle    string
	Tagline     string
	Description string
	Email       string
	URL         string
	Telephone   string
	ImageURL    string

	// Work
	WorksForName string
	WorksForURL  string
	HasOccupation []Occupation

	// Credentials
	AlumniOf      []Education
	HasCredential []Credential
	Award         []Award

	// Expertise
	KnowsAbout []KnowsAbout

	// Social
	SameAs []SameAs

	// Reviews
	AggregateRatingValue  float64
	AggregateReviewCount  int
	AggregateRatingBest   float64
	Reviews               []Review
	Testimonials          []Review
}

type Tenant struct {
	Slug         string
	Domain       string
	HTMLTemplate string
	Person       Person
}

// ── Server ────────────────────────────────────────────────────────────────────

var db *pgxpool.Pool

func main() {
	var err error
	db, err = pgxpool.New(context.Background(), os.Getenv("SUPABASE_DSN"))
	if err != nil {
		log.Fatalf("unable to connect to database: %v", err)
	}
	defer db.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	http.HandleFunc("/", handleTenantPage)
	log.Printf("oat server listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleTenantPage(w http.ResponseWriter, r *http.Request) {
	hostname := stripPort(r.Host)

	tenant, err := resolveTenant(r.Context(), hostname)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	if tenant.HTMLTemplate == "" {
		http.Error(w, "no template configured", http.StatusNotFound)
		return
	}

	tmpl, err := template.New("page").Parse(tenant.HTMLTemplate)
	if err != nil {
		log.Printf("template parse error for %s: %v", tenant.Slug, err)
		http.Error(w, "template error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tmpl.Execute(w, tenant); err != nil {
		log.Printf("template execute error for %s: %v", tenant.Slug, err)
	}
}

// ── Data fetching ─────────────────────────────────────────────────────────────

func resolveTenant(ctx context.Context, hostname string) (*Tenant, error) {
	slug := extractSlug(hostname)

	var tenant Tenant
	row := db.QueryRow(ctx, `
		SELECT t.slug, t.domain, COALESCE(t.html_template, '')
		FROM tenants t
		WHERE (t.domain = $1 OR t.slug = $2)
		  AND t.status = 'active'
		LIMIT 1
	`, hostname, slug)

	if err := row.Scan(&tenant.Slug, &tenant.Domain, &tenant.HTMLTemplate); err != nil {
		return nil, err
	}

	if err := fetchPerson(ctx, &tenant); err != nil {
		log.Printf("person fetch error for %s: %v", tenant.Slug, err)
		// Serve the template anyway — it may handle empty data gracefully
	}

	return &tenant, nil
}

func fetchPerson(ctx context.Context, tenant *Tenant) error {
	p := &tenant.Person

	// ── Core fields ───────────────────────────────────────────────────────────
	var personID int
	var imageID *int
	row := db.QueryRow(ctx, `
		SELECT
			p.id,
			COALESCE(p.name, ''),
			COALESCE(p.job_title, ''),
			COALESCE(p.tagline, ''),
			COALESCE(p.description, ''),
			COALESCE(p.email, ''),
			COALESCE(p.url, ''),
			COALESCE(p.telephone, ''),
			COALESCE(p.works_for_name, ''),
			COALESCE(p.works_for_url, ''),
			COALESCE(p.aggregate_rating_rating_value, 0),
			COALESCE(p.aggregate_rating_review_count, 0),
			COALESCE(p.aggregate_rating_best_rating, 5),
			p.image_id
		FROM person p
		JOIN tenants t ON p.tenant_id = t.id
		WHERE t.slug = $1
		LIMIT 1
	`, tenant.Slug)

	if err := row.Scan(
		&personID,
		&p.Name, &p.JobTitle, &p.Tagline, &p.Description,
		&p.Email, &p.URL, &p.Telephone,
		&p.WorksForName, &p.WorksForURL,
		&p.AggregateRatingValue, &p.AggregateReviewCount, &p.AggregateRatingBest,
		&imageID,
	); err != nil {
		return err
	}

	// ── Media URL ─────────────────────────────────────────────────────────────
	if imageID != nil {
		var url string
		if err := db.QueryRow(ctx,
			`SELECT COALESCE(url, '') FROM media WHERE id = $1`, imageID,
		).Scan(&url); err == nil {
			p.ImageURL = url
		}
	}

	// ── sameAs ────────────────────────────────────────────────────────────────
	rows, err := db.Query(ctx, `
		SELECT COALESCE(url, ''), COALESCE(label, '')
		FROM person_same_as WHERE _parent_id = $1 ORDER BY _order
	`, personID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var s SameAs
			if rows.Scan(&s.URL, &s.Label) == nil {
				p.SameAs = append(p.SameAs, s)
			}
		}
	}

	// ── hasOccupation ─────────────────────────────────────────────────────────
	rows, err = db.Query(ctx, `
		SELECT COALESCE(name,''), COALESCE(organization,''),
		       COALESCE(to_char(start_date,'Month YYYY'),''),
		       COALESCE(to_char(end_date,'Month YYYY'),''),
		       COALESCE(description,'')
		FROM person_has_occupation WHERE _parent_id = $1 ORDER BY _order
	`, personID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var o Occupation
			if rows.Scan(&o.Name, &o.Organization, &o.StartDate, &o.EndDate, &o.Description) == nil {
				p.HasOccupation = append(p.HasOccupation, o)
			}
		}
	}

	// ── alumniOf ──────────────────────────────────────────────────────────────
	rows, err = db.Query(ctx, `
		SELECT COALESCE(name,''), COALESCE(degree,''),
		       COALESCE(to_char(end_date,'YYYY'),''), COALESCE(url,'')
		FROM person_alumni_of WHERE _parent_id = $1 ORDER BY _order
	`, personID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var e Education
			if rows.Scan(&e.Name, &e.Degree, &e.EndDate, &e.URL) == nil {
				p.AlumniOf = append(p.AlumniOf, e)
			}
		}
	}

	// ── hasCredential ─────────────────────────────────────────────────────────
	rows, err = db.Query(ctx, `
		SELECT COALESCE(name,''), COALESCE(issued_by,''),
		       COALESCE(to_char(date_issued,'Month YYYY'),''), COALESCE(url,'')
		FROM person_has_credential WHERE _parent_id = $1 ORDER BY _order
	`, personID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var c Credential
			if rows.Scan(&c.Name, &c.IssuedBy, &c.DateIssued, &c.URL) == nil {
				p.HasCredential = append(p.HasCredential, c)
			}
		}
	}

	// ── award ─────────────────────────────────────────────────────────────────
	rows, err = db.Query(ctx, `
		SELECT COALESCE(name,''), COALESCE(issued_by,''),
		       COALESCE(to_char(date,'Month YYYY'),''), COALESCE(url,'')
		FROM person_award WHERE _parent_id = $1 ORDER BY _order
	`, personID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var a Award
			if rows.Scan(&a.Name, &a.IssuedBy, &a.Date, &a.URL) == nil {
				p.Award = append(p.Award, a)
			}
		}
	}

	// ── knowsAbout ────────────────────────────────────────────────────────────
	rows, err = db.Query(ctx, `
		SELECT COALESCE(topic,''), COALESCE(level,'expert')
		FROM person_knows_about WHERE _parent_id = $1 ORDER BY _order
	`, personID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var k KnowsAbout
			if rows.Scan(&k.Topic, &k.Level) == nil {
				p.KnowsAbout = append(p.KnowsAbout, k)
			}
		}
	}

	// ── review / testimonials ─────────────────────────────────────────────────
	rows, err = db.Query(ctx, `
		SELECT COALESCE(author,''), COALESCE(review_body,''),
		       COALESCE(to_char(date_published,'Month YYYY'),''),
		       COALESCE(is_testimonial, false)
		FROM person_review WHERE _parent_id = $1 ORDER BY _order
	`, personID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var r Review
			if rows.Scan(&r.Author, &r.ReviewBody, &r.DatePublished, &r.IsTestimonial) == nil {
				if r.IsTestimonial {
					p.Testimonials = append(p.Testimonials, r)
				} else {
					p.Reviews = append(p.Reviews, r)
				}
			}
		}
	}

	return nil
}

// ── Helpers ───────────────────────────────────────────────────────────────────

func stripPort(host string) string {
	if idx := strings.LastIndex(host, ":"); idx != -1 {
		return host[:idx]
	}
	return host
}

func extractSlug(hostname string) string {
	parts := strings.Split(hostname, ".")
	if len(parts) > 2 {
		return parts[0]
	}
	return hostname
}

// Ensure time package is used (for future cache headers etc.)
var _ = time.Now
