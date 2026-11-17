// Set this to the hosted WordPress URL after the backend is deployed.
// Use the local Playground API only when previewing this site on the same computer.
const cmsOverride = new URLSearchParams(location.search).get('cmsApi');
const isLocalPreview = ['localhost', '127.0.0.1'].includes(location.hostname);
window.CITRINE_CMS_API = cmsOverride || (isLocalPreview ? 'http://127.0.0.1:9400/wp-json/citrine/v1/content' : '');
