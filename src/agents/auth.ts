const { GoogleAuth } = require('google-auth-library');

async function authenticate() {
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/cloud-platform'
  });

  const client = await auth.getClient();
  const projectId = await auth.getProjectId();

  return { client, projectId };
}
