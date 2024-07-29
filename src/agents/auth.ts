import { GoogleAuth } from 'google-auth-library';

const googleCredentials = {
  type: "service_account",
  project_id: "secret-willow-427111-e1",
  private_key_id: "c63308342e7936ae9eb08d8a955c20dcfb2a26c1",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC33xpTq7l0urJb\nEQQFnp3K8dXEiIjRpmFwXH3I9zyBMPXq77aWnZGvYGAM8qB/jfdArqlCNVqN6fPh\ndd8JswEmqSzHnSY/BuRE1/KBj0GpOHe0n0sQvcqm/B6AcH4uzIt4968j/Ou4QkgV\nGOkCUMBxHZ13hO3LWDcXmrHXWOMDrkoPZSsnS3KQh7ibmubtWDvEZ1rWoelVnk8U\nDaTlRKCDbcnqfKMxNrKx8Fz/UePNODX0QtBK+V1WHHv4jFFOc6zBq7YR+j3j/fIU\nZG+VGnmsHlqsbBc6eKf3131VeB+cbOyzHQ+8r0LMtevxuABqj0Oq/LsppdmiyrJH\nrw2KhV8NAgMBAAECggEABMsMVY+LBq5iPV+ow5kSWHVsQugN7FctFZUs/ernWR/P\nXVKRPNplL0BGKLg/c6vIp6yV7XZUwrvNTNHk4KIZtCoMqInMctqpYzEKRD3Zh+wt\n/1eis5BFrYuHeQYrB+nISKeTmXl7pJftEfMOX0N/IhkT9IcS0tjycLX/5P2kcgFS\n7DnTbQ1J+p/OPw4E9kU812w6Xvab6d/b9Q84a9LRH2Iy+MqnoP0hGAH4b8wTVNve\nN4SsocVwAoPBjR6C/1AqBfnFMmyhtt/BoigTiHsAa4LjhCtVYsW87w1eWLYjG6NT\nlD+O0CQW1O2URUdYJ8Mv6liSRGxglgpMFc+wMb660QKBgQD8iCQwBsijbTKU+czJ\nxgBrMVDhLcQu/4bscUl5TDEfKCETbBijbZuHnRtBS3LPeS42gA2tk0hyOpL2pN93\nSnSoUtcR3ROq2NDFhVc7Ir2mJyoMHDXAU14tDXyS27/swUuxjBY5ky0enPPpdZNL\nPhOUsbbGGesiLXblUtzxmDnS/QKBgQC6ZZBG4VGK4i6CvjLbqjQybNdyIEvyIa3e\nZWcOYkJaVD8C14FX6icjKz/0/VtR+ZOuzb6cEFPIwzAaRJGZftvD9y8sNoZTyFyj\nA00JNSH2yzLQS+4HxJuUTvGzlQ5zJhZ41ym92EGfxQ49Pvny7pH7489MqPAl3rY3\n58fU1FMhUQKBgBNnssAuBUTpozVnbKEkoeuawohLKAQkho2stuSnQi8OulvvtoT4\nazckj2+ZCJ2AxlhRxrtL0glVDu39BV75TbWRiA1LW7OJLaG/+VAF/2TBJa4AjPDW\ndyonGyd902WyBMsD5MFP2eu8S9HowwTJJGAMt+rJGxRpQfWlRG0cMXVRAoGAb3Kk\nhkzYZZMBPjkczYyB8xhy5RD8d8S9Ybj9mnMTu1Cd8EQMWRVu2y9T6VbHEEeKjr0D\n1+pHPkW+cCZJbB6WpiAYe3YKcPPet7UUjYnQSfCK7FJJ+ykJ4O4mxDo+TokabJwx\noAo6ip3W+rW52w/cB2DZpLtqAyqbhue16sIdBlECgYEA9UysIerdR7dmYVjhHb3/\n0aFVwsWPgqKxoVICDle/fELaHKFBePnMQFZfUgJRHeWMPNstMWISaxWMqPTa3K/L\nhJoPNgJKM35xKq+EhWXeFSSZfUl4YgW+MucOmZLFTbusEux1rXwTAfzyHR+7Nivi\naSN91JUPfR1YBl4pFbP+2eY=\n-----END PRIVATE KEY-----\n",
  client_email: "test1-826@secret-willow-427111-e1.iam.gserviceaccount.com",
  client_id: "114328814532762651030",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/test1-826%40secret-willow-427111-e1.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

(async () => {
  try {
    // Convert the credentials to a JSON string and then parse it using GoogleAuth.fromJSON
    const auth = new GoogleAuth();
    const client = auth.fromJSON(googleCredentials);

    // Example usage of the GoogleAuth library to verify authentication
    const projectId = await auth.getProjectId();
    console.log('Project ID:', projectId);
  } catch (error) {
    console.error('Error setting up Google Application Credentials:', error);
  }
})();
