# Deploying Gemini Enterprise API Explorer to Google Cloud Run

This guide outlines how to build and deploy your containerized Gemini Enterprise API Explorer to **Google Cloud Run** using Google Cloud CLI.

---

## Prerequisites

1. **Google Cloud SDK (`gcloud` CLI)**: Make sure you have the CLI installed and authenticated:
   ```bash
   gcloud auth login
   ```
2. **Set your Active Project**:
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```
3. **Enable Required APIs**: Enable Cloud Run, Cloud Build, and Artifact Registry APIs:
   ```bash
   gcloud services enable run.googleapis.com \
                          cloudbuild.googleapis.com \
                          artifactregistry.googleapis.com
   ```

---

## Configuration: OAuth Authorized Redirect URIs

Before deploying, ensure you configure your **OAuth Client ID** in the Google Cloud Console (`APIs & Services > Credentials`):
1. Locate your OAuth 2.0 Client ID.
2. Under **Authorized Redirect URIs**, add your Cloud Run service URL with `/oauth2callback` path, for example:
   - `https://ge-api-explorer-xxxx-xx.a.run.app/oauth2callback`
   
> [!NOTE]
> Since you may not know your Cloud Run URL before the first deployment, you can deploy the app first, retrieve the URL, add it to your GCP credentials, and then your OAuth login will work perfectly.

---

## Option 1: Quick Deployment (One-Command)

Google Cloud Run can build your container using your local `Dockerfile` and deploy it directly in a single step using Google Cloud Build in the cloud:

```bash
gcloud run deploy ge-api-explorer-oauth2 \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Option 2: Enterprise Production Deployment (Recommended)

For secure enterprise deployments, it is best practice to store sensitive OAuth secrets in **Google Secret Manager** instead of exposing them in plain text environment variables.

### Step 1: Create Secrets in Secret Manager
Enable the Secret Manager API:
```bash
gcloud services enable secretmanager.googleapis.com
```

Create your secrets:
```bash
echo -n "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create GOOGLE_CLIENT_ID --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create GOOGLE_CLIENT_SECRET --data-file=-
```

### Step 2: Grant Permissions to Cloud Run
Cloud Run services use the default Compute Engine service account to access secrets. Give it secret accessor rights:
```bash
# Find your project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Grant secret accessor to default compute service account
gcloud secrets add-iam-policy-binding GOOGLE_CLIENT_ID \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding GOOGLE_CLIENT_SECRET \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Deploy Cloud Run referencing Secret Manager
Deploy the application, linking your Secret Manager secrets directly to Cloud Run's environment variables:

```bash
gcloud run deploy ge-api-explorer \
  --source . \
  --region us-central1 \
  --set-secrets="GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest" \
  --allow-unauthenticated
```

---

## Option 3: Standard Build and Push Flow

If you want separate steps to build the image and then deploy it, you can push it to **Artifact Registry**:

### Step 1: Create an Artifact Registry Repository
```bash
gcloud artifacts repositories create ge-api-explorer-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for GE API Explorer"
```

### Step 2: Build and Push Image using Cloud Build
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ge-api-explorer-repo/api-explorer:latest
```

### Step 3: Deploy the Built Image to Cloud Run
```bash
gcloud run deploy ge-api-explorer \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/ge-api-explorer-repo/api-explorer:latest \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Managing and Updating the Deployment

To view logs or update configurations:
- **View service status**: `gcloud run services describe ge-api-explorer --region us-central1`
- **Stream logs**: `gcloud beta run services logs tail ge-api-explorer --region us-central1`
