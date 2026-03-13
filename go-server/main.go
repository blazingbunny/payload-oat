package main

import (
	"context"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Person holds the data fetched from Supabase for a tenant.
type Person struct {
	Name        string
	JobTitle    string
	Tagline     string
	Description string
	Email       string
	URL         string
}

// Tenant holds the tenant record including their custom HTML template.
type Tenant struct {
	Slug         string
	Domain       string
	HTMLTemplate string
	Person       Person
}

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

// handleTenantPage resolves the tenant from the request hostname,
// fetches their person data, and renders their HTML template.
func handleTenantPage(w http.ResponseWriter, r *http.Request) {
	hostname := r.Host
	// Strip port if present (e.g. localhost:8080)
	if idx := strings.LastIndex(hostname, ":"); idx != -1 {
		hostname = hostname[:idx]
	}

	tenant, err := resolveTenant(r.Context(), hostname)
	if err != nil {
		http.Error(w, "tenant not found", http.StatusNotFound)
		return
	}

	if tenant.HTMLTemplate == "" {
		http.Error(w, "no template configured for this tenant", http.StatusNotFound)
		return
	}

	tmpl, err := template.New("page").Parse(tenant.HTMLTemplate)
	if err != nil {
		log.Printf("template parse error for tenant %s: %v", tenant.Slug, err)
		http.Error(w, "template error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tmpl.Execute(w, tenant); err != nil {
		log.Printf("template execute error for tenant %s: %v", tenant.Slug, err)
	}
}

// resolveTenant looks up the tenant by domain or slug subdomain,
// then fetches the associated person record.
func resolveTenant(ctx context.Context, hostname string) (*Tenant, error) {
	var tenant Tenant

	// Try exact domain match first, then slug subdomain (slug.yourdomain.com)
	slug := extractSlug(hostname)

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

	// Fetch associated person
	pRow := db.QueryRow(ctx, `
		SELECT
			COALESCE(p.name, ''),
			COALESCE(p.job_title, ''),
			COALESCE(p.tagline, ''),
			COALESCE(p.description, ''),
			COALESCE(p.email, ''),
			COALESCE(p.url, '')
		FROM person p
		JOIN tenants t ON p.tenant_id = t.id
		WHERE t.slug = $1
		LIMIT 1
	`, tenant.Slug)

	if err := pRow.Scan(
		&tenant.Person.Name,
		&tenant.Person.JobTitle,
		&tenant.Person.Tagline,
		&tenant.Person.Description,
		&tenant.Person.Email,
		&tenant.Person.URL,
	); err != nil {
		log.Printf("no person found for tenant %s: %v", tenant.Slug, err)
		// Return tenant with empty person — template may still render
	}

	return &tenant, nil
}

// extractSlug returns the first subdomain label from a hostname.
// e.g. "adrian.yourdomain.com" → "adrian"
func extractSlug(hostname string) string {
	parts := strings.Split(hostname, ".")
	if len(parts) > 2 {
		return parts[0]
	}
	return hostname
}
