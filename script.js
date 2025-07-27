// **IMPORTANT: For a production application, NEVER expose your API key client-side.**
// You would need a backend server to proxy requests to remove.bg.
const REMOVE_BG_API_KEY = 'RNhzczLTrLxzi7xNxRgR5WxN'; // Replace with your actual API key

const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage'); // For initial display and background removal
const processedImage = document.getElementById('processedImage'); // For displaying results after background removal/resizing/cropping
const noImageMessage = document.getElementById('noImageMessage');

const removeBgBtn = document.getElementById('removeBgBtn');
const downloadBtn = document.getElementById('downloadBtn');

const colorPicker = document.getElementById('colorPicker');
const applyColorBgBtn = document.getElementById('applyColorBgBtn');
const customBgUpload = document.getElementById('customBgUpload');
const applyCustomBgBtn = document.getElementById('applyCustomBgBtn');

// Cropping Elements
const showCropToolBtn = document.getElementById('showCropToolBtn');
const cropTargetImage = document.getElementById('cropTargetImage'); // The image Cropper.js will work on
const cropActions = document.getElementById('cropActions');
const aspectRatioOptions = document.querySelectorAll('input[name="aspectRatio"]');
const cropImageBtn = document.getElementById('cropImageBtn');
const resetCropBtn = document.getElementById('resetCropBtn');

// Resizing Elements
const resizeWidthInput = document.getElementById('resizeWidth');
const resizeHeightInput = document.getElementById('resizeHeight');
const maintainAspectCheckbox = document.getElementById('maintainAspect');
const resizeImageBtn = document.getElementById('resizeImageBtn');

let originalFile = null; // Stores the initially uploaded file
let currentImageBlob = null; // Stores the most recently processed image blob (for download)
let cropper = null; // Cropper.js instance

// --- Event Listeners ---

imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        originalFile = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            // Display the uploaded image for initial view/BG removal
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            processedImage.style.display = 'none';
            noImageMessage.style.display = 'none';

            // Prepare image for cropping (Cropper.js will work on this one)
            cropTargetImage.src = e.target.result;

            enableControls(true);
            currentImageBlob = null; // Reset current processed image
            downloadBtn.style.display = 'none';

            // If cropper is active, destroy it and re-initialize for new image
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }
            showCropToolBtn.textContent = 'Activate Crop Tool';
            cropActions.style.display = 'none';
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
    showLoading(true);

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

        displayProcessedImage(imageUrl, imageBlob);

    } catch (error) {
        console.error('Error removing background:', error);
        alert('Failed to remove background. Please try again. Error: ' + error.message);
        displayOriginalImage(); // Revert to original if processing fails
    } finally {
        removeBgBtn.disabled = false;
        removeBgBtn.textContent = 'Remove Background';
        showLoading(false);
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

// --- Cropping Tool Events ---
showCropToolBtn.addEventListener('click', () => {
    if (!originalFile) {
        alert('Please upload an image first.');
        return;
    }

    if (cropper) {
        cropper.destroy();
        cropper = null;
        showCropToolBtn.textContent = 'Activate Crop Tool';
        cropActions.style.display = 'none';
        displayProcessedImage(processedImage.src, currentImageBlob); // Show the current processed image if any
    } else {
        uploadedImage.style.display = 'none';
        processedImage.style.display = 'none';
        noImageMessage.style.display = 'none';
        cropTargetImage.style.display = 'block';

        cropper = new Cropper(cropTargetImage, {
            aspectRatio: 1 / 1, // Default to 1:1, can be changed by radio buttons
            viewMode: 1, // Restrict the crop box to not exceed the canvas
            autoCropArea: 0.8, // 80% of the image
            ready: function () {
                cropImageBtn.disabled = false;
                resetCropBtn.disabled = false;
            },
            cropend: function() {
                // You can get crop data here if needed on crop end
            }
        });
        showCropToolBtn.textContent = 'Deactivate Crop Tool';
        cropActions.style.display = 'flex'; // Make flex to arrange items
        cropActions.style.flexDirection = 'column'; // Stack vertically
        cropActions.style.gap = '10px';
    }
});

aspectRatioOptions.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (cropper) {
            const ratio = e.target.value === '0' ? 0 : eval(e.target.value); // Use eval carefully if values are not controlled
            cropper.setAspectRatio(ratio);
        }
    });
});

cropImageBtn.addEventListener('click', () => {
    if (cropper && originalFile) {
        showLoading(true);
        cropImageBtn.disabled = true;
        resetCropBtn.disabled = true;

        const croppedCanvas = cropper.getCroppedCanvas();
        croppedCanvas.toBlob((blob) => {
            const croppedImageUrl = URL.createObjectURL(blob);
            displayProcessedImage(croppedImageUrl, blob);
            cropper.destroy(); // Destroy cropper after cropping
            cropper = null;
            cropTargetImage.style.display = 'none';
            showCropToolBtn.textContent = 'Activate Crop Tool';
            cropActions.style.display = 'none';
            showLoading(false);
            cropImageBtn.disabled = false;
            resetCropBtn.disabled = false;
        }, 'image/png'); // Using PNG for quality, can be 'image/jpeg' with quality
    }
});

resetCropBtn.addEventListener('click', () => {
    if (cropper) {
        cropper.reset();
    }
});

// --- Resizing Tool Events ---
resizeWidthInput.addEventListener('input', () => {
    if (maintainAspectCheckbox.checked && originalFile) {
        // Calculate height based on aspect ratio
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const newWidth = parseInt(resizeWidthInput.value);
            if (!isNaN(newWidth) && newWidth > 0) {
                resizeHeightInput.value = Math.round(newWidth / aspectRatio);
            }
        };
        // Use the current displayed image (processed or original) for aspect ratio calculation
        img.src = processedImage.style.display === 'block' ? processedImage.src : uploadedImage.src;
    }
});

resizeHeightInput.addEventListener('input', () => {
    if (maintainAspectCheckbox.checked && originalFile) {
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const newHeight = parseInt(resizeHeightInput.value);
            if (!isNaN(newHeight) && newHeight > 0) {
                resizeWidthInput.value = Math.round(newHeight * aspectRatio);
            }
        };
        img.src = processedImage.style.display === 'block' ? processedImage.src : uploadedImage.src;
    }
});


resizeImageBtn.addEventListener('click', async () => {
    if (!originalFile) {
        alert('Please upload an image first.');
        return;
    }

    const width = parseInt(resizeWidthInput.value);
    const height = parseInt(resizeHeightInput.value);

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        alert('Please enter valid positive dimensions for resizing.');
        return;
    }

    resizeImageBtn.disabled = true;
    resizeImageBtn.textContent = 'Resizing...';
    showLoading(true);

    try {
        const img = new Image();
        img.src = processedImage.style.display === 'block' ? processedImage.src : uploadedImage.src; // Use current displayed image

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                const resizedImageUrl = URL.createObjectURL(blob);
                displayProcessedImage(resizedImageUrl, blob);
                resizeImageBtn.disabled = false;
                resizeImageBtn.textContent = 'Resize Image';
                showLoading(false);
            }, 'image/png', 0.95); // Output as PNG with good quality
        };
        img.onerror = () => {
            throw new Error('Could not load image for resizing.');
        };

    } catch (error) {
        console.error('Error resizing image:', error);
        alert('Failed to resize image. Error: ' + error.message);
        resizeImageBtn.disabled = false;
        resizeImageBtn.textContent = 'Resize Image';
        showLoading(false);
    }
});


// --- Helper Functions ---

function enableControls(enable) {
    removeBgBtn.disabled = !enable;
    applyColorBgBtn.disabled = !enable;
    applyCustomBgBtn.disabled = !enable;
    showCropToolBtn.disabled = !enable;
    resizeWidthInput.disabled = !enable;
    resizeHeightInput.disabled = !enable;
    resizeImageBtn.disabled = !enable;
    maintainAspectCheckbox.disabled = !enable;
    // downloadBtn is handled separately after a successful process
}

function resetEditor() {
    originalFile = null;
    currentImageBlob = null;
    uploadedImage.src = '#';
    uploadedImage.style.display = 'none';
    processedImage.src = '#';
    processedImage.style.display = 'none';
    cropTargetImage.src = '#';
    cropTargetImage.style.display = 'none';
    noImageMessage.style.display = 'block';
    enableControls(false);
    downloadBtn.style.display = 'none';
    removeBgBtn.textContent = 'Remove Background';
    resizeWidthInput.value = '';
    resizeHeightInput.value = '';
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
    showCropToolBtn.textContent = 'Activate Crop Tool';
    cropActions.style.display = 'none';
    cropImageBtn.disabled = true;
    resetCropBtn.disabled = true;
    showLoading(false);
}

function displayProcessedImage(url, blob) {
    processedImage.src = url;
    processedImage.style.display = 'block';
    uploadedImage.style.display = 'none';
    noImageMessage.style.display = 'none';
    currentImageBlob = blob;
    downloadBtn.style.display = 'block';
    // If cropper was active, hide its image
    if (cropper) {
        cropTargetImage.style.display = 'none';
    }
}

function displayOriginalImage() {
    if (originalFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
            processedImage.style.display = 'none';
            noImageMessage.style.display = 'none';
            currentImageBlob = null; // No processed image yet
            downloadBtn.style.display = 'none';
        };
        reader.readAsDataURL(originalFile);
    } else {
        resetEditor();
    }
}


async function applySolidBackground(mainImageFile, color) {
    if (!mainImageFile) return;

    applyColorBgBtn.disabled = true;
    applyColorBgBtn.textContent = 'Applying Color...';
    showLoading(true);

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

        displayProcessedImage(imageUrl, imageBlob);

    } catch (error) {
        console.error('Error applying solid background:', error);
        alert('Failed to apply solid background. Error: ' + error.message);
        displayOriginalImage(); // Revert if fails
    } finally {
        applyColorBgBtn.disabled = false;
        applyColorBgBtn.textContent = 'Apply Color';
        showLoading(false);
    }
}

async function applyCustomBackground(mainImageFile, customBgDataURL) {
    if (!mainImageFile) return;

    applyCustomBgBtn.disabled = true;
    applyCustomBgBtn.textContent = 'Applying Custom BG...';
    showLoading(true);

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
        const resultBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

        const resultUrl = URL.createObjectURL(resultBlob);
        displayProcessedImage(resultUrl, resultBlob);

        URL.revokeObjectURL(foregroundUrl); // Clean up
        URL.revokeObjectURL(resultUrl); // Clean up

    } catch (error) {
        console.error('Error applying custom background:', error);
        alert('Failed to apply custom background. Error: ' + error.message);
        displayOriginalImage(); // Revert if fails
    } finally {
        applyCustomBgBtn.disabled = false;
        applyCustomBgBtn.textContent = 'Apply Custom BG';
        showLoading(false);
    }
}

function showLoading(isLoading) {
    const body = document.querySelector('body');
    if (isLoading) {
        body.style.cursor = 'wait';
        // You might want to add a visible spinner/overlay here
    } else {
        body.style.cursor = 'default';
        // Remove spinner/overlay
    }
}


// Initial state
resetEditor();
