import crypto from 'node:crypto';
import {createRemoteJWKSet,jwtVerify} from 'jose';

// World ID OIDC (Authorization Code + PKCE). All endpoints come from the issuer's discovery
// document, so a change of World domain only needs WORLD_ISSUER. The documented issuer is
// https://id.worldcoin.org; set WORLD_ISSUER if your Developer Portal app shows another.
export const DEFAULT_ISSUER='https://id.worldcoin.org';
const ALLOWED_SUFFIXES=['worldcoin.org','world.org'];
const b64=x=>Buffer.from(x).toString('base64url');
const issuerOf=env=>(env.WORLD_ISSUER||DEFAULT_ISSUER).replace(/\/$/,'');
export function trustedHost(u){let h;try{h=new URL(u).hostname}catch{return false}return ALLOWED_SUFFIXES.some(s=>h===s||h.endsWith('.'+s))}

export async function discover(env=process.env,fetcher=fetch){
 const issuer=issuerOf(env);
 if(!trustedHost(issuer))throw Error('WORLD_ISSUER must be a World domain');
 const r=await fetcher(`${issuer}/.well-known/openid-configuration`);
 if(!r.ok)throw Error('World discovery failed');
 const d=await r.json();
 if(d.issuer?.replace(/\/$/,'')!==issuer)throw Error('World discovery issuer mismatch');
 for(const k of ['authorization_endpoint','token_endpoint','jwks_uri'])if(!trustedHost(d[k]))throw Error(`Unexpected World discovery endpoint: ${k}`);
 return d;
}

export async function startWorld(env=process.env,fetcher=fetch){
 if(!env.WORLD_CLIENT_ID||!env.WORLD_CLIENT_SECRET||!env.WORLD_REDIRECT_URI)throw Error('World credentials not configured');
 const d=await discover(env,fetcher);
 const state=b64(crypto.randomBytes(24)),nonce=b64(crypto.randomBytes(24)),verifier=b64(crypto.randomBytes(32));
 const challenge=b64(crypto.createHash('sha256').update(verifier).digest());
 const url=new URL(d.authorization_endpoint);
 for(const [k,v] of Object.entries({client_id:env.WORLD_CLIENT_ID,redirect_uri:env.WORLD_REDIRECT_URI,response_type:'code',scope:'openid',state,nonce,code_challenge:challenge,code_challenge_method:'S256'}))url.searchParams.set(k,v);
 return {state,nonce,verifier,url:url.toString(),created:Date.now(),issuer:d.issuer};
}

export async function finishWorld(params,attempt,env=process.env,fetcher=fetch){
 // `iss` on the callback is optional (RFC 9207): check it only when the provider sends it.
 if(!attempt||Date.now()-attempt.created>300000||!params.code||params.state!==attempt.state||(params.iss&&params.iss.replace(/\/$/,'')!==attempt.issuer.replace(/\/$/,'')))throw Error('World callback state/issuer/expiry invalid');
 const d=await discover(env,fetcher);
 const body=new URLSearchParams({grant_type:'authorization_code',code:params.code,redirect_uri:env.WORLD_REDIRECT_URI,code_verifier:attempt.verifier});
 const headers={'Content-Type':'application/x-www-form-urlencoded'};
 if((env.WORLD_CLIENT_AUTH||'client_secret_basic')==='client_secret_post'){body.set('client_id',env.WORLD_CLIENT_ID);body.set('client_secret',env.WORLD_CLIENT_SECRET)}
 else{headers.Authorization='Basic '+Buffer.from(`${encodeURIComponent(env.WORLD_CLIENT_ID)}:${encodeURIComponent(env.WORLD_CLIENT_SECRET)}`).toString('base64')}
 const r=await fetcher(d.token_endpoint,{method:'POST',headers,body});
 if(!r.ok)throw Error('World token exchange failed');
 const token=await r.json();if(!token.id_token)throw Error('World ID token missing');
 const {payload}=await jwtVerify(token.id_token,createRemoteJWKSet(new URL(d.jwks_uri)),{issuer:d.issuer,audience:env.WORLD_CLIENT_ID});
 if(payload.nonce!==attempt.nonce||!payload.sub)throw Error('World nonce or subject invalid');
 return {sub:payload.sub,issuer:d.issuer,authenticatedAt:Date.now()};
}
