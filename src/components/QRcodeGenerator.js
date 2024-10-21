import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRcodeGenerator= () => {  // Rename your component to something unique
    const [text, setText] = useState('');  // User input for QR code

    const handleInputChange = (e) => {
        setText(e.target.value);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>QR Code Generator</h2>
            <input
                type="text"
                value={text}
                onChange={handleInputChange}
                placeholder="3.0"
                style={{ marginBottom: '20px', padding: '10px', width: '300px' }}
            />
            <div>
                {text && (
                    <QRCodeCanvas
                        value={text}
                        size={256}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="Q"
                        includeMargin={true}
                    />
                )}
            </div>
        </div>
    );
};

export default QRcodeGenerator;
