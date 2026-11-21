# Voting app backend contract
Set `API_BASE` in `config.js`. JSON over HTTPS. Requests send cookies (`credentials: 'include'`).

| Call | Returns |
|---|---|
| `GET /session/voter` | `{ name, idMasked, municipality, ward, vd, phoneLast4 }` for the voter the official checked in |
| `POST /session/verify` body `{ otp }` | `{ ok: true }` only after the server checks the biometric result and the SMS code |
| `GET /ballot` | `{ ward: [{id,name,party,acr,photo?,logo?}], pr: [{id,name,acr,logo?}] }`, only after verify, in official draw order |
| `POST /ballot/cast` body `{ ward, pr, receipt }` | `{ ok: true }` |

## Rules
- **Secrecy:** `/ballot/cast` carries no ID. The server must mark the voter as voted and store the ballot in separate records with nothing linking them (no shared session id, timestamp or row order). Store `receipt` (random hash) with the ballot for audit.
- **One vote:** the server decides eligibility and rejects a second cast. The tablet's checks are only for the user interface.
- **Verification is real only on the server.** The fingerprint button is a simulation until a reader is integrated.
- **CORS:** allow the voting app's origin. **HTTPS only.** No secrets in this repo.
- **Results:** publish a hash of the final totals on BNB Chain from the backend; the voter website's Verify results page reads it.
