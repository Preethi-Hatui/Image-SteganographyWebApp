function hideMessage() {
    const fileInput = document.getElementById("imageInput");
    const message = document.getElementById("message").value.trim();

    if (fileInput.files.length === 0 || message === "") {
        alert("Please select an image and enter a message.");
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

            // Convert message to binary
            let binaryMessage = "";
            for (let i = 0; i < message.length; i++) {
                let binaryChar = message.charCodeAt(i).toString(2).padStart(8, '0');
                binaryMessage += binaryChar;
            }
            binaryMessage += "00000000"; // End delimiter

            // Store binary message in pixels
            let messageIndex = 0;
            for (let i = 0; i < data.length; i += 4) {
                if (messageIndex < binaryMessage.length) {
                    data[i] = (data[i] & 0xFE) | parseInt(binaryMessage[messageIndex], 2); // Modify red channel
                    messageIndex++;
                }
            }

            ctx.putImageData(imageData, 0, 0);

            // Save the new image
            const downloadLink = document.createElement("a");
            downloadLink.href = canvas.toDataURL("image/png");
            downloadLink.download = "hidden_message.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            alert("Message hidden in image successfully!");
        };
    };
    reader.readAsDataURL(fileInput.files[0]);
}

function extractMessage() {
    const fileInput = document.getElementById("imageInput");

    if (fileInput.files.length === 0) {
        alert("Please select an image to extract the message.");
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
                if (byte === "00000000") break; // Stop at delimiter
                extractedMessage += String.fromCharCode(parseInt(byte, 2));
            }

            document.getElementById("output").innerText = "Hidden Message: " + extractedMessage;
        };
    };
    reader.readAsDataURL(fileInput.files[0]);
}
