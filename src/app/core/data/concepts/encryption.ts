import { ConceptContent } from '../../models/content.model';

export const ENCRYPTION: ConceptContent = {
  categoryId: "enterprise-java",
  topicId: "enterprise-java",
  conceptId: "encryption",
  title: "Encryption",
  topicType: "framework",
  simpleIntuition: "A database backup file gets accidentally uploaded to a public cloud storage bucket. If every social security number inside it was stored in plain text, that mistake is now a full blown data breach. If it was encrypted, that same mistake is just an embarrassing configuration error.",
  formalMeaning: "Encryption transforms readable data into unreadable ciphertext using a key, so that even if the data itself is exposed, it is worthless without that key, and choosing the right kind of encryption depends entirely on whether the same party that encrypts needs to also decrypt.",
  whyItExists: "Sensitive data, personal information, payment details, credentials, will eventually end up somewhere it should not, a leaked backup, a misconfigured bucket, a stolen laptop. Encryption is the last line of defense that makes stolen data actually useless to whoever stole it.",
  howItWorksInternally: [
    "Symmetric encryption (AES being the modern standard) uses the SAME key to both encrypt and decrypt. It is fast and efficient for large amounts of data, but requires that key to somehow be shared securely between whoever encrypts and whoever decrypts.",
    "Asymmetric encryption (RSA, and increasingly elliptic curve based algorithms) uses a mathematically linked key PAIR, a public key that can encrypt (or verify), and a private key that alone can decrypt (or sign). This solves the key sharing problem but is significantly slower, which is why it is typically used to securely exchange a symmetric key rather than to encrypt bulk data directly.",
    "TLS (what makes HTTPS secure) actually combines both: an asymmetric handshake at the start of a connection to safely agree on a shared symmetric key, then fast symmetric encryption for the actual bulk data transfer for the rest of the session.",
    "Hashing is a DIFFERENT, related but distinct concept: it is a ONE WAY transformation with no key and no way to reverse it, used for things like storing passwords, where you never actually need to recover the original value, only verify a match.",
    "Encryption at rest (data encrypted while stored, in a database or file system) and encryption in transit (data encrypted while moving over a network, via TLS) are both necessary and address different threats, one protects against a stolen disk or backup, the other against an eavesdropper on the network.",
    "Key management, where encryption keys themselves are stored, rotated, and who can access them, is arguably the hardest and most important part of any real encryption strategy. An encryption scheme is only as strong as how well its keys are protected, which is why dedicated key management services (AWS KMS, HashiCorp Vault) exist rather than hardcoding keys in application config."
  ],
  mainComponents: [
    "It is like the difference between a locked box that opens with the exact same key it was locked with (symmetric encryption, fast, but you have to somehow safely share that one key) versus a mail slot that anyone can drop letters into but only the box owner has the key to open (asymmetric encryption, slower, but nobody needs to share a secret to use it)."
  ],
  realWorldExamples: [
    "A database column storing customer social security numbers using AES encryption at rest, so that even a leaked database backup file reveals only unreadable ciphertext without the corresponding key.",
    "An HTTPS connection between a browser and a server using an asymmetric handshake briefly, just to safely establish a shared symmetric key, then switching to fast symmetric encryption for the actual page content.",
    "Interview question: \"Why not just use asymmetric encryption for everything, since it seems more secure?\" Because asymmetric encryption is computationally far more expensive than symmetric encryption, making it impractical for encrypting large volumes of data directly, it is instead typically used to securely exchange a symmetric key."
  ],
  complexityAndTradeoffs: [
    "Before: A leaked database backup or an accidental misconfiguration immediately exposes every sensitive value in plain, readable text.",
    "After: The exact same leak exposes only ciphertext, which is worthless without the separately protected encryption key.",
    "Encryption at rest is a required control in nearly every serious compliance framework (PCI DSS, HIPAA, and similar), precisely because it is the single most effective mitigation against the very common failure mode of data being exposed by accident rather than through a sophisticated attack.",
    "Symmetric encryption (AES): use it when encrypting bulk data, database fields, or files, where both encrypting and decrypting happen within systems you control and can securely share a key between. Avoid it when scenarios where two parties who have never securely exchanged a shared secret need to communicate confidentially.",
    "Asymmetric encryption (RSA, elliptic curve): use it when establishing a secure channel between parties with no prior shared secret, or digitally signing data to prove authenticity. Avoid it when encrypting large volumes of data directly, where its computational cost makes it impractical compared to symmetric encryption.",
    "Hashing (for passwords specifically, not general \"encryption\"): use it when storing a value you only ever need to VERIFY, never actually recover, like a password. Avoid it when any value you genuinely need to read back in its original form later, since hashing is deliberately irreversible."
  ],
  commonMistakes: [
    "Treating \"hashing\" and \"encryption\" as interchangeable terms, and hashing a value like a credit card number that the system genuinely needs to recover and use later. Hashing is deliberately one way, there is no key or process that reverses a hash back into the original value. Using it for data you actually need to read back later makes that data permanently, irrecoverably unusable, not securely protected. Fix: Use encryption (reversible, with a key) for data you need to read back later, and hashing (irreversible) only for data you merely need to verify a match against, like passwords."
  ],
  interviewPerspective: "A common way this gets tested: \"Why is TLS/HTTPS described as using both asymmetric and symmetric encryption, rather than just one or the other?\" Asymmetric encryption is used briefly during the initial handshake specifically to safely establish a shared secret without ever transmitting it in the clear, then the connection switches to fast symmetric encryption, using that now shared secret, for the actual bulk data transfer, since symmetric encryption is far more efficient for large amounts of data.",
  triggerSentence: "Encryption is what makes a data leak merely embarrassing instead of catastrophic, but only if the keys were protected at least as carefully as the data itself."
};
