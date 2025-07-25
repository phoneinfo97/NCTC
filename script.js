const uploadInput = document.getElementById("upload");
const preview = document.getElementById("preview");
const colorPicker = document.getElementById("colorPicker");
const bgUpload = document.getElementById("bgUpload");
const generateBtn = document.getElementById("generate");

let originalImage = null;

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" id="previewImage" class="rounded shadow"/>`;
    originalImage = file;
  };
  reader.readAsDataURL(file);
});

generateBtn.addEventListener("click", async () => {
  if (!originalImage) return alert("Upload image first.");

  const formData = new FormData();
  formData.append("image", originalImage);

  const res = await fetch("http://localhost:5000/remove-bg", {
    method: "POST",
    body: formData,
  });

  const blob = await res.blob();
  const imageUrl = URL.createObjectURL(blob);

  let bgColor = colorPicker.value;
  preview.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-[${bgColor}]"><img src="${imageUrl}" class="w-full object-contain"/></div>`;
});

// Optional: Custom background upload logic (advanced)
