import React, { useState } from 'react';
import { auth } from '../firebaseConfig'; // Ensure this path is correct
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const PhoneAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);

  const setUpRecaptcha = () => {
    // Ensure the recaptcha verifier is created and rendered
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container', 
        { 'size': 'invisible' }, 
        auth
      );
      window.recaptchaVerifier.render();
    }
  };

  const handleSendCode = async () => {
    try {
      setUpRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setIsCodeSent(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleVerifyCode = async () => {
    if (confirmationResult) {
      try {
        await confirmationResult.confirm(verificationCode);
        alert('Phone number verified successfully!');
      } catch (error) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div>
      <h1>Phone Number Authentication</h1>
      <div id="recaptcha-container"></div>
      <input
        type="text"
        placeholder="Enter phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <button onClick={handleSendCode}>Send Verification Code</button>
      {isCodeSent && (
        <div>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <button onClick={handleVerifyCode}>Verify Code</button>
        </div>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default PhoneAuth;
