// **IMPORTANT: For a production application, NEVER expose your API key client-side.**
// You would need a backend server to proxy requests to remove.bg.
const REMOVE_BG_API_KEY = 'NsqYTFfs62ok544xzwZ8MGAa'; // Replace with your actual API key

const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const processedImage = document.getElementById('processedImage');
const noImageMessage = document.getElementById('noImageMessage');
const removeBgBtn = document.getElementById('removeBgBtn');
const downloadBtn = document.getElementById('downloadBtn');
const colorPicker = document.getElementById('colorPicker');
const applyColorBgBtn = document.getElementById('applyColorBgBtn');
const customBgUpload = document.getElementById('customBgUpload');
const applyCustomBgBtn = document.getElementById('applyCustomBgBtn');

let originalFile = null; // To store the original image file
let currentImageBlob = null; // To store the currently processed image blob for download

// --- Event Listeners ---

imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        originalFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            processedImage.style.display = 'none'; // Hide processed until processed
            noImageMessage.style.display = 'none';
            enableControls(true);
            currentImageBlob = null; // Reset current processed image
            downloadBtn.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        resetEditor();
    }
});

removeBgBtn.addEventListener('click', async () => {
    if (!originalFile) {
        alert('Please upload an image first.');
        return;
    }

    removeBgBtn.disabled = true;
    removeBgBtn.textContent = 'Removing Background...';

    try {
        const formData = new FormData();
        formData.append('image_file', originalFile);
        formData.append('size', 'auto'); // 'auto' or 'full' for higher quality

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': REMOVE_BG_API_KEY
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`remove.bg API error: ${errorData.errors ? errorData.errors.map(err => err.title).join(', ') : response.statusText}`);
        }

        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        processedImage.src = imageUrl;
        processedImage.style.display = 'block';
        uploadedImage.style.display = 'none'; // Hide original
        noImageMessage.style.display = 'none';

        currentImageBlob = imageBlob; // Store blob for download
        downloadBtn.style.display = 'block';

    } catch (error) {
        console.error('Error removing background:', error);
        alert('Failed to remove background. Please try again. Error: ' + error.message);
        // Revert to original image if processing fails
        uploadedImage.style.display = 'block';
        processedImage.style.display = 'none';
        currentImageBlob = null;
        downloadBtn.style.display = 'none';
    } finally {
        removeBgBtn.disabled = false;
        removeBgBtn.textContent = 'Remove Background';
    }
});

applyColorBgBtn.addEventListener('click', () => {
    if (!originalFile) {
        alert('Please upload an image first.');
        return;
    }

    const color = colorPicker.value;
    applySolidBackground(originalFile, color);
});

customBgUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && originalFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            applyCustomBackground(originalFile, e.target.result); // e.target.result is base64 for the custom background
        };
        reader.readAsDataURL(file);
    } else if (!originalFile) {
        alert('Please upload a primary image first.');
    }
});

downloadBtn.addEventListener('click', () => {
    if (currentImageBlob) {
        const url = URL.createObjectURL(currentImageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'passport_photo_edited.png'; // or .jpg
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up
    } else {
        alert('No processed image to download.');
    }
});

// --- Helper Functions ---

function enableControls(enable) {
    removeBgBtn.disabled = !enable;
    applyColorBgBtn.disabled = !enable;
    applyCustomBgBtn.disabled = !enable;
    // downloadBtn.disabled = !enable; // Download enabled only after processing
}

function resetEditor() {
    originalFile = null;
    currentImageBlob = null;
    uploadedImage.src = '#';
    uploadedImage.style.display = 'none';
    processedImage.src = '#';
    processedImage.style.display = 'none';
    noImageMessage.style.display = 'block';
    enableControls(false);
    downloadBtn.style.display = 'none';
    removeBgBtn.textContent = 'Remove Background';
}

async function applySolidBackground(mainImageFile, color) {
    if (!mainImageFile) return;

    // This is a simplified approach. For true merging, you'd use Canvas API.
    // For now, let's assume the user first removes the background, then applies color.

    // If a processed image (without background) exists, use that.
    // Otherwise, you'd need to re-process the original with the background.
    // The remove.bg API allows specifying a background color directly.
    // Let's modify the remove.bg call to include the background color.

    applyColorBgBtn.disabled = true;
    applyColorBgBtn.textContent = 'Applying Color...';

    try {
        const formData = new FormData();
        formData.append('image_file', mainImageFile);
        formData.append('size', 'auto');
        formData.append('bg_color', color.substring(1)); // remove '#' for API

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': REMOVE_BG_API_KEY
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`remove.bg API error: ${errorData.errors ? errorData.errors.map(err => err.title).join(', ') : response.statusText}`);
        }

        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);

        processedImage.src = imageUrl;
        processedImage.style.display = 'block';
        uploadedImage.style.display = 'none';
        noImageMessage.style.display = 'none';

        currentImageBlob = imageBlob;
        downloadBtn.style.display = 'block';

    } catch (error) {
        console.error('Error applying solid background:', error);
        alert('Failed to apply solid background. Error: ' + error.message);
        // Revert to previous state if fails
        if (originalFile) {
            uploadedImage.style.display = 'block';
            processedImage.style.display = 'none';
        } else {
            resetEditor();
        }
    } finally {
        applyColorBgBtn.disabled = false;
        applyColorBgBtn.textContent = 'Apply Color';
    }
}

async function applyCustomBackground(mainImageFile, customBgDataURL) {
    if (!mainImageFile) return;

    applyCustomBgBtn.disabled = true;
    applyCustomBgBtn.textContent = 'Applying Custom BG...';

    try {
        // First, remove the background of the main image
        const removeBgFormData = new FormData();
        removeBgFormData.append('image_file', mainImageFile);
        removeBgFormData.append('size', 'auto');

        const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': REMOVE_BG_API_KEY
            },
            body: removeBgFormData
        });

        if (!removeBgResponse.ok) {
            const errorData = await removeBgResponse.json();
            throw new Error(`remove.bg API error (step 1): ${errorData.errors ? errorData.errors.map(err => err.title).join(', ') : removeBgResponse.statusText}`);
        }

        const foregroundBlob = await removeBgResponse.blob();
        const foregroundUrl = URL.createObjectURL(foregroundBlob);

        // Now, composite the foreground with the custom background using Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const foregroundImg = new Image();
        const customBgImg = new Image();

        const loadImage = (image, src) => {
            return new Promise((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = reject;
                image.src = src;
            });
        };

        await Promise.all([
            loadImage(foregroundImg, foregroundUrl),
            loadImage(customBgImg, customBgDataURL)
        ]);

        // Set canvas dimensions based on foreground image (or custom logic)
        canvas.width = foregroundImg.width;
        canvas.height = foregroundImg.height;

        // Draw custom background first, scaling to fit canvas
        ctx.drawImage(customBgImg, 0, 0, canvas.width, canvas.height);

        // Draw foreground image on top
        ctx.drawImage(foregroundImg, 0, 0, canvas.width, canvas.height);

        // Get the result as a Blob
        const resultBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); // Output as PNG to preserve transparency if any

        const resultUrl = URL.createObjectURL(resultBlob);
        processedImage.src = resultUrl;
        processedImage.style.display = 'block';
        uploadedImage.style.display = 'none';
        noImageMessage.style.display = 'none';

        currentImageBlob = resultBlob;
        downloadBtn.style.display = 'block';

        URL.revokeObjectURL(foregroundUrl); // Clean up
        URL.revokeObjectURL(resultUrl); // Clean up

    } catch (error) {
        console.error('Error applying custom background:', error);
        alert('Failed to apply custom background. Error: ' + error.message);
        // Revert to previous state if fails
        if (originalFile) {
            uploadedImage.style.display = 'block';
            processedImage.style.display = 'none';
        } else {
            resetEditor();
        }
    } finally {
        applyCustomBgBtn.disabled = false;
        applyCustomBgBtn.textContent = 'Apply Custom BG';
    }
}

// Initial state
resetEditor();
