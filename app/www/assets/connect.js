const SERVER_URL="http://dintdt.c1.biz/safepet/"
// const SERVER_URL="http://localhost/safepet/server/";

// La llave pública del servidor web donde están los endpoints de la API
const serverPublicJWK = {"alg":"RSA-OAEP-256","e":"AQAB","ext":true,"key_ops":["encrypt"],"kty":"RSA","n":"xwCjMDAPoO3wAqh982Fqklx0XC_yw8cpwAihn28KUEMma5GgZZ0duNZ8yu-NwgfYHS3y8i4kuIcEfbZbooawbWqhOWJFDxrsCWfKfGSFlO98dL0ondxkeD6q-xF8S5-o6b6pgX5RM9d2_a1YML_qS9kEm39hMa3rSIFY0GMrSWpG-Ox3653jvomn8Vt8oSQIT4Mf3R-tke-7Kw1U5plTcqKHb15FZ1SACw2G8ZDBc_uukWIp2oAeykLrej9DgGk6f87-fj2GPNkmADeCT6q0tLxHWdM_qh20fRbPWdpfcHnZ2ctYDWzgZPzNHJ2j4bhbytwXakT2BtepCDxMf2EDQQ"}

// https://gist.github.com/mholt/813db71291de8e45371fe7c4749df99c
// Convert an ArrayBuffer into a string.
// From https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function arrayBufToString(buf) {
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

// https://gist.github.com/mholt/813db71291de8e45371fe7c4749df99c
function pemEncode(label, data) {
	const base64encoded = window.btoa(data);
	const base64encodedWrapped = base64encoded.replace(/(.{64})/g, "$1\n");
	return `-----BEGIN ${label}-----\n${base64encodedWrapped}\n-----END ${label}-----`;
}

// https://gist.github.com/mholt/813db71291de8e45371fe7c4749df99c
async function exportKeyAsString(format, key) {
	const exported = await window.crypto.subtle.exportKey(format, key);
	return arrayBufToString(exported);
}

// https://gist.github.com/mholt/813db71291de8e45371fe7c4749df99c
async function pemEncodedPrivateKey(keyPair) {
	const exported = await exportKeyAsString("pkcs8", keyPair.privateKey);
	return pemEncode("PRIVATE KEY", exported);
}

// https://gist.github.com/mholt/813db71291de8e45371fe7c4749df99c
async function pemEncodedPublicKey(keyPair) {
	const exported = await exportKeyAsString("spki", keyPair.publicKey);
	return pemEncode("PUBLIC KEY", exported);
}

// https://www.slingacademy.com/article/generate-and-manage-keys-with-the-web-crypto-api-in-javascript/
async function encryptData(publicKey, data) {
	const encoded = new TextEncoder().encode(data);
	return await window.crypto.subtle.encrypt({
		name: "RSA-OAEP"
		}, publicKey, encoded);
}

// https://www.slingacademy.com/article/generate-and-manage-keys-with-the-web-crypto-api-in-javascript/
async function decryptData(privateKey, ciphertext) {
	const decrypted = await window.crypto.subtle.decrypt({
		name: "RSA-OAEP"
		}, privateKey, ciphertext);
	return new TextDecoder().decode(decrypted);
}

// https://www.slingacademy.com/article/generate-and-manage-keys-with-the-web-crypto-api-in-javascript/
async function importPublicKey(jwk) {
	const key = await window.crypto.subtle.importKey(
		"jwk",
		jwk,
		{
			name: "RSA-OAEP",
			hash: "SHA-256"
		},
		true,
		["encrypt"]
	);
	//console.log("Imported Public Key: ", key);
	return key;
}

// https://www.slingacademy.com/article/generate-and-manage-keys-with-the-web-crypto-api-in-javascript/
async function exportPublicKey(key) {
  const exported = await window.crypto.subtle.exportKey("jwk", key.publicKey);
  console.log("Exported Public Key: ", exported);
  return exported;
}

async function generateKeyPair(){
	return (await window.crypto.subtle.generateKey(
		{name:"RSA-OAEP",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["encrypt","decrypt"]))
}

async function request(url,body){
	/*
	// Crea un nuevo par de llaves privada/pública para esta petición
	//console.log("Requesting from ["+url+"]")
	let requestKeys = await generateKeyPair();
	//console.log("Generated keys")
	let requestBody={}
	requestBody["responseKey"]=await pemEncodedPublicKey(requestKeys);
	//console.log("Encoded Public Key: ("+requestBody["responseKey"]+")")
	requestBody["data"]=arrayBufToString(await encryptData(await importPublicKey(serverPublicJWK),JSON.stringify(body)))
	console.log("Encrypted request as ("+requestBody["data"]+")")
	let response = await fetch(url,{
		method:"POST",
		body:new URLSearchParams(requestBody)
	}).then(r=>r.ok?r.text():{"status":"NULL"})
	console.log(response)
	if(response.status != "NULL"){
		return decryptData(requestKeys.privateKey,response.data)
	}
	*/
	return unsafeRequest(url,body)
}

async function unsafeRequest(url,body){
	return await fetch(url,{
		method:"POST",
		body:new URLSearchParams(body)})
	.then(r=>r.ok?r.text():"NULL")
	.then((j)=>{
		if(j=="NULL")
			return {"status":"NULL"}
		else
			try{ return JSON.parse(j) }
			catch(e){ return {"status":"TEXT","json":j} }
	})
}