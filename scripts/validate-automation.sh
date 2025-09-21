#!/bin/bash

# 🔧 Automation & CI/CD Pipeline Validation Script
# Casey - Senior DevOps Engineer
# Validates all automation, CI/CD, and deployment infrastructure

set -e

echo "🔧 Video Player Demo - Automation Validation"
echo "=============================================="
echo ""

# Configuration
PROJECT_ROOT="/Users/johndilig/Projects/video-player-demo"
WEB_APP_DIR="$PROJECT_ROOT/apps/web-player-pages"
BACKEND_DIR="$PROJECT_ROOT/apps/streaming-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check file exists
file_exists() {
    if [[ -f "$1" ]]; then
        log_success "Found: $1"
        return 0
    else
        log_error "Missing: $1"
        return 1
    fi
}

# Function to validate GitHub Actions
validate_github_actions() {
    log_info "Validating GitHub Actions workflows..."

    local workflows_dir="$PROJECT_ROOT/.github/workflows"
    local required_workflows=("ci.yml" "deploy.yml")
    local validation_passed=true

    if [[ ! -d "$workflows_dir" ]]; then
        log_error "GitHub workflows directory not found"
        return 1
    fi

    for workflow in "${required_workflows[@]}"; do
        if file_exists "$workflows_dir/$workflow"; then
            # Validate workflow syntax
            if command_exists "yamllint"; then
                if yamllint "$workflows_dir/$workflow" >/dev/null 2>&1; then
                    log_success "YAML syntax valid: $workflow"
                else
                    log_warning "YAML syntax issues in: $workflow"
                    validation_passed=false
                fi
            fi

            # Check for required secrets
            if grep -q "VERCEL_TOKEN" "$workflows_dir/$workflow"; then
                log_success "Vercel integration configured in $workflow"
            else
                log_warning "Vercel integration missing in $workflow"
            fi
        else
            validation_passed=false
        fi
    done

    if $validation_passed; then
        log_success "GitHub Actions workflows validated"
    else
        log_error "GitHub Actions validation failed"
        return 1
    fi
}

# Function to validate Docker configuration
validate_docker_config() {
    log_info "Validating Docker configuration..."

    local docker_files=(
        "$BACKEND_DIR/Dockerfile"
        "$BACKEND_DIR/docker-compose.yml"
        "$BACKEND_DIR/.dockerignore"
        "$BACKEND_DIR/nginx.conf"
        "$BACKEND_DIR/prometheus.yml"
    )

    local validation_passed=true

    for docker_file in "${docker_files[@]}"; do
        if ! file_exists "$docker_file"; then
            validation_passed=false
        fi
    done

    # Validate Dockerfile best practices
    if [[ -f "$BACKEND_DIR/Dockerfile" ]]; then
        local dockerfile="$BACKEND_DIR/Dockerfile"

        if grep -q "node:18-alpine" "$dockerfile"; then
            log_success "Using secure Alpine base image"
        else
            log_warning "Consider using Alpine base image for security"
        fi

        if grep -q "USER" "$dockerfile"; then
            log_success "Non-root user configured"
        else
            log_error "Dockerfile should use non-root user"
            validation_passed=false
        fi

        if grep -q "HEALTHCHECK" "$dockerfile"; then
            log_success "Health check configured"
        else
            log_warning "Consider adding health check to Dockerfile"
        fi
    fi

    # Test Docker build
    if command_exists "docker"; then
        log_info "Testing Docker build..."
        cd "$BACKEND_DIR"
        if docker build --target development -t streaming-backend-test . >/dev/null 2>&1; then
            log_success "Docker build successful"
            docker rmi streaming-backend-test >/dev/null 2>&1 || true
        else
            log_error "Docker build failed"
            validation_passed=false
        fi
        cd "$PROJECT_ROOT"
    else
        log_warning "Docker not available for build test"
    fi

    if $validation_passed; then
        log_success "Docker configuration validated"
    else
        log_error "Docker validation failed"
        return 1
    fi
}

# Function to validate package.json scripts
validate_npm_scripts() {
    log_info "Validating npm scripts..."

    local apps=("web-player-pages" "streaming-backend")
    local validation_passed=true

    for app in "${apps[@]}"; do
        local package_json="$PROJECT_ROOT/apps/$app/package.json"

        if [[ -f "$package_json" ]]; then
            log_info "Checking $app package.json..."

            # Required scripts
            local required_scripts=("start" "test")

            for script in "${required_scripts[@]}"; do
                if jq -e ".scripts.\"$script\"" "$package_json" >/dev/null 2>&1; then
                    log_success "$app has '$script' script"
                else
                    log_error "$app missing '$script' script"
                    validation_passed=false
                fi
            done

            # Check for build script in web app
            if [[ "$app" == "web-player-pages" ]]; then
                if jq -e '.scripts.build' "$package_json" >/dev/null 2>&1; then
                    log_success "$app has build script"
                else
                    log_error "$app missing build script"
                    validation_passed=false
                fi
            fi
        else
            log_error "Package.json not found for $app"
            validation_passed=false
        fi
    done

    if $validation_passed; then
        log_success "npm scripts validated"
    else
        log_error "npm scripts validation failed"
        return 1
    fi
}

# Function to validate test automation
validate_test_automation() {
    log_info "Validating test automation..."

    local validation_passed=true

    # Check for test files
    if [[ -d "$WEB_APP_DIR/tests" ]] || find "$WEB_APP_DIR" -name "*.test.*" -o -name "*.spec.*" | grep -q .; then
        log_success "Test files found in web app"
    else
        log_warning "No test files found in web app"
    fi

    if [[ -d "$BACKEND_DIR/tests" ]] || find "$BACKEND_DIR" -name "*.test.*" -o -name "*.spec.*" | grep -q .; then
        log_success "Test files found in backend"
    else
        log_warning "No test files found in backend"
    fi

    # Check for test configuration
    local test_configs=(
        "$WEB_APP_DIR/jest.config.js"
        "$WEB_APP_DIR/playwright.config.ts"
        "$BACKEND_DIR/jest.config.js"
    )

    for config in "${test_configs[@]}"; do
        if [[ -f "$config" ]]; then
            log_success "Found test config: $(basename "$config")"
        fi
    done

    # Check for lighthouse configuration
    if [[ -f "$WEB_APP_DIR/lighthouserc.js" ]]; then
        log_success "Lighthouse CI configuration found"
    else
        log_warning "Lighthouse CI configuration missing"
    fi

    if $validation_passed; then
        log_success "Test automation validated"
    else
        log_error "Test automation validation failed"
        return 1
    fi
}

# Function to validate Vercel configuration
validate_vercel_config() {
    log_info "Validating Vercel configuration..."

    local validation_passed=true

    # Check for Vercel configuration files
    local vercel_files=(
        "$WEB_APP_DIR/vercel.json"
        "$BACKEND_DIR/vercel.json"
    )

    for vercel_file in "${vercel_files[@]}"; do
        if [[ -f "$vercel_file" ]]; then
            log_success "Found Vercel config: $vercel_file"

            # Validate JSON syntax
            if jq empty "$vercel_file" >/dev/null 2>&1; then
                log_success "Valid JSON syntax in $(basename "$vercel_file")"
            else
                log_error "Invalid JSON syntax in $(basename "$vercel_file")"
                validation_passed=false
            fi
        fi
    done

    # Check for .vercelignore files
    if [[ -f "$BACKEND_DIR/.vercelignore" ]]; then
        log_success "Backend .vercelignore found"
    else
        log_warning "Backend .vercelignore missing"
    fi

    if $validation_passed; then
        log_success "Vercel configuration validated"
    else
        log_error "Vercel validation failed"
        return 1
    fi
}

# Function to validate automation scripts
validate_automation_scripts() {
    log_info "Validating automation scripts..."

    local validation_passed=true

    # Check for existing automation scripts
    local scripts=(
        "$BACKEND_DIR/test-endpoints.sh"
    )

    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            log_success "Found automation script: $(basename "$script")"

            # Check if script is executable
            if [[ -x "$script" ]]; then
                log_success "Script is executable: $(basename "$script")"
            else
                log_warning "Script not executable: $(basename "$script")"
                chmod +x "$script"
                log_success "Made script executable: $(basename "$script")"
            fi
        fi
    done

    if $validation_passed; then
        log_success "Automation scripts validated"
    else
        log_error "Automation scripts validation failed"
        return 1
    fi
}

# Function to validate dependencies
validate_dependencies() {
    log_info "Validating dependencies..."

    local validation_passed=true

    # Check for required tools
    local required_tools=("node" "npm" "git")

    for tool in "${required_tools[@]}"; do
        if command_exists "$tool"; then
            local version
            case "$tool" in
                "node")
                    version=$(node --version)
                    log_success "$tool available: $version"
                    ;;
                "npm")
                    version=$(npm --version)
                    log_success "$tool available: $version"
                    ;;
                "git")
                    version=$(git --version | cut -d' ' -f3)
                    log_success "$tool available: $version"
                    ;;
            esac
        else
            log_error "$tool not available"
            validation_passed=false
        fi
    done

    # Check for optional tools
    local optional_tools=("docker" "docker-compose" "jq" "yamllint")

    for tool in "${optional_tools[@]}"; do
        if command_exists "$tool"; then
            log_success "Optional tool available: $tool"
        else
            log_warning "Optional tool not available: $tool"
        fi
    done

    if $validation_passed; then
        log_success "Dependencies validated"
    else
        log_error "Dependencies validation failed"
        return 1
    fi
}

# Function to run quick smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."

    # Test if we can install dependencies
    log_info "Testing dependency installation..."

    cd "$BACKEND_DIR"
    if npm ci >/dev/null 2>&1; then
        log_success "Backend dependencies install successfully"
    else
        log_error "Backend dependency installation failed"
        return 1
    fi

    cd "$WEB_APP_DIR"
    if npm ci >/dev/null 2>&1; then
        log_success "Web app dependencies install successfully"
    else
        log_error "Web app dependency installation failed"
        return 1
    fi

    cd "$PROJECT_ROOT"

    log_success "Smoke tests completed"
}

# Main validation function
main() {
    log_info "Starting comprehensive automation validation..."
    echo ""

    local failed_validations=()

    # Run all validations
    validate_dependencies || failed_validations+=("Dependencies")
    echo ""

    validate_github_actions || failed_validations+=("GitHub Actions")
    echo ""

    validate_docker_config || failed_validations+=("Docker Configuration")
    echo ""

    validate_npm_scripts || failed_validations+=("npm Scripts")
    echo ""

    validate_test_automation || failed_validations+=("Test Automation")
    echo ""

    validate_vercel_config || failed_validations+=("Vercel Configuration")
    echo ""

    validate_automation_scripts || failed_validations+=("Automation Scripts")
    echo ""

    run_smoke_tests || failed_validations+=("Smoke Tests")
    echo ""

    # Summary
    echo "🎯 Validation Summary"
    echo "===================="

    if [[ ${#failed_validations[@]} -eq 0 ]]; then
        log_success "All validations passed! 🎉"
        echo ""
        log_info "CI/CD Pipeline Status: ✅ READY"
        log_info "Docker Infrastructure: ✅ READY"
        log_info "Automation Scripts: ✅ READY"
        log_info "Deployment Pipeline: ✅ READY"
        echo ""
        log_success "System is ready for FOX Corporation demonstration!"
        echo ""
        echo "Next steps:"
        echo "  • Run 'git add .' to stage new infrastructure files"
        echo "  • Run 'git commit -m \"feat: complete DevOps infrastructure with Docker & CI/CD\"'"
        echo "  • Push to GitHub to trigger CI/CD pipeline"
        echo "  • Deploy to Vercel for production demonstration"
        echo ""
        return 0
    else
        log_error "Validation failures detected:"
        for failure in "${failed_validations[@]}"; do
            echo "  ❌ $failure"
        done
        echo ""
        log_error "Please address the above issues before proceeding"
        return 1
    fi
}

# Execute main function
main "$@"