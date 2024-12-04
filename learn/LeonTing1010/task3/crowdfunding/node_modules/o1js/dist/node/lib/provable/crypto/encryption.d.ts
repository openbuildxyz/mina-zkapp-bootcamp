import { Field, Group } from '../wrapped.js';
import { PrivateKey, PublicKey } from './signature.js';
import { Bytes } from '../bytes.js';
export { encrypt, decrypt, encryptBytes, decryptBytes, CipherTextBytes, CipherText, };
type CipherText = {
    publicKey: Group;
    cipherText: Field[];
};
type CipherTextBytes = CipherText & {
    messageLength: number;
};
/**
 * Decrypts a {@link CipherText} using a {@link PrivateKey}.
 */
declare function decrypt({ publicKey, cipherText }: CipherText, privateKey: PrivateKey): import("../field.js").Field[];
/**
 * Public Key Encryption, encrypts Field elements using a {@link PublicKey}.
 */
declare function encrypt(message: Field[], otherPublicKey: PublicKey): CipherText;
/**
 * Public Key Encryption, encrypts Bytes using a {@link PublicKey}.
 */
declare function encryptBytes(message: Bytes, otherPublicKey: PublicKey): CipherTextBytes;
/**
 * Decrypts a {@link CipherText} using a {@link PrivateKey}.
 */
declare function decryptBytes(cipherText: CipherTextBytes, privateKey: PrivateKey): Bytes;
