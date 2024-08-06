const captureImageButton = document.getElementById('captureImage');
const uploadImagesButton = document.getElementById('uploadImages');
const cameraFeed = document.getElementById('cameraFeed');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const imageList = document.getElementById('image-list');
const gallery = document.getElementById('gallery');
const capturedImage = document.getElementById('capturedImage');

let stream;
let images = [];

function dataURLToBlob(dataURL) {
    const [header, data] = dataURL.split(',');
    const mime = header.split(':')[1].split(';')[0];
    const byteString = atob(data);
    const u8arr = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
        u8arr[i] = byteString.charCodeAt(i);
    }

    return new Blob([u8arr], { type: mime });
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraFeed.srcObject = stream;
    } catch (err) {
        console.error('Error accessing webcam:', err);
    }
}
function captureImage() {





    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;
    context.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');



    const img = document.createElement('img');
    img.src = imageData;
    img.title = `Captured on ${new Date().toLocaleString()}`;
    img.addEventListener('click', () => {
        capturedImage.src = imageData;
    });

    gallery.appendChild(img);

    // Save image data for future upload
    images.push(imageData);
    // addImageToList(imageData);


    // Add image to gallery
    const imgElement = document.createElement('img');
    imgElement.src = imageData;
    // imageList.appendChild(imageData);
}

function uploadImages(event) {
    if (event) {
        event.preventDefault(); // Prevent default form behavior
    }

    if (images.length === 0) {
        console.error('No images to upload');
        return;
    }

    const blob = dataURLToBlob(images[images.length - 1]);

    // Convert the canvas to a Blob

    if (!blob) {
        console.error('Failed to create blob');
        return;
    }

    const formData = new FormData();
    formData.append('file', blob, 'captured_image.jpg');

    console.log(formData);

    // Upload captured image to the server
    fetch('http://192.168.0.119:8080/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Upload successful:', data);

            // Get references to the input fields
            const customerField = document.getElementById('customer');
            const AsField = document.getElementById('As');
            const trackingField = document.getElementById('Tracking');
            const carrierField = document.getElementById('Carrier');

            // Update the customer and As fields with the response data only if they are empty
            if (!customerField.value) {
                customerField.value = data.name;
            }
            if (!AsField.value) {
                AsField.value = data.As;
            }
            if (!trackingField.value) {
                trackingField.value = data.tracking_number;
            }
            if (!carrierField.value) {
                carrierField.value = data.carrier;
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });

}


// Start the camera when the page loads
window.onload = startCamera;

captureImageButton.addEventListener('click', function (event) {
    captureImage(event);
});
uploadImagesButton.addEventListener('click', function (event) {
    uploadImages(event);
});