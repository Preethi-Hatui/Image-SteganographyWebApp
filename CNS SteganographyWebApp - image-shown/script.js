// Function to preview selected image
function previewImage() {
    const fileInput = document.getElementById("imageInput");
    const imageContainer = document.getElementById("imageContainer");
    const imagePreview = document.getElementById("imagePreview");

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imageContainer.classList.remove("hidden"); // Show image preview
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        imageContainer.classList.add("hidden"); // Hide image preview if no file selected
    }
}

// Function to hide message inside an image
function hideMessage() {
    const fileInput = document.getElementById("imageInput");
    const message = document.getElementById("message").value.trim();
    const key = document.getElementById("key").value.trim();

    if (fileInput.files.length === 0 || message === "" || key === "") {
        alert("Please select an image, enter a message, and provide a secret key.");
        return;
    }

    // Compress and Encrypt the message
    const compressedMessage = LZString.compress(message);
    const encryptedMessage = CryptoJS.AES.encrypt(compressedMessage, key).toString();

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Convert message to binary
            let binaryMessage = "";
            for (let i = 0; i < encryptedMessage.length; i++) {
                let binaryChar = encryptedMessage.charCodeAt(i).toString(2).padStart(8, '0');
                binaryMessage += binaryChar;
            }
            binaryMessage += "00000000"; // End marker

            let messageIndex = 0;
            for (let i = 0; i < data.length; i += 4) {
                if (messageIndex < binaryMessage.length) {
                    data[i] = (data[i] & 0xFE) | parseInt(binaryMessage[messageIndex], 2);
                    messageIndex++;
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Save the new image
            const downloadLink = document.createElement("a");
            downloadLink.href = canvas.toDataURL("image/png");
            downloadLink.download = "secure_message.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            alert("Message hidden successfully!");
        };
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// Function to extract the hidden message
function extractMessage() {
    const fileInput = document.getElementById("imageInput");
    const key = document.getElementById("key").value.trim();

    if (fileInput.files.length === 0 || key === "") {
        alert("Please select an image and enter the secret key.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let binaryMessage = "";
            for (let i = 0; i < data.length; i += 4) {
                binaryMessage += (data[i] & 1).toString();
            }

            let extractedMessage = "";
            for (let i = 0; i < binaryMessage.length; i += 8) {
                let byte = binaryMessage.slice(i, i + 8);
                if (byte === "00000000") break;
                extractedMessage += String.fromCharCode(parseInt(byte, 2));
            }

            // Decrypt message
            try {
                const decryptedMessage = CryptoJS.AES.decrypt(extractedMessage, key).toString(CryptoJS.enc.Utf8);
                const decompressedMessage = LZString.decompress(decryptedMessage);

                if (decompressedMessage) {
                    document.getElementById("output").innerText = "Hidden Message: " + decompressedMessage;
                } else {
                    document.getElementById("output").innerText = "Incorrect Key! Cannot decrypt.";
                }
            } catch (error) {
                document.getElementById("output").innerText = "Incorrect Key! Cannot decrypt.";
            }
        };
    };
    reader.readAsDataURL(fileInput.files[0]);
}
