#!/bin/bash
export PORT=3000
# Pipe newlines to auto-select first option for any migration prompts
yes '' | /usr/bin/pnpm dev
