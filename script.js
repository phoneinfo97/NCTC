let selectedImage = null;
let removedBgUrl = null;

const uploadInput = document.getElementById("upload");
const preview = document.getElementById("preview");
const colorPicker = document.getElementById("colorPicker");
const bgUpload = document.getElementById("bgUpload");

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    selectedImage = file;
    preview.innerHTML = `<img src="${reader.result}">`;
  };
  reader.readAsDataURL(file);
});

document.getElementById("removeBg").addEventListener("click", async () => {
  if (!selectedImage) return Swal.fire("Please upload an image first.");
  const formData = new FormData();
  formData.append("image", selectedImage);
  try {
    const res = await fetch("http://localhost:5000/remove-bg", {
      method: "POST",
      body: formData
    });
    const blob = await res.blob();
    removedBgUrl = URL.createObjectURL(blob);
    preview.innerHTML = `<img src="${removedBgUrl}">`;
  } catch (err) {
    Swal.fire("Error removing background.");
  }
});

document.getElementById("applyBg").addEventListener("click", () => {
  const color = colorPicker.value;
  const customBg = bgUpload.files[0];
  if (customBg) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.innerHTML = `
        <div style="position:relative; width:200px; height:260px;">
          <img src="${reader.result}" style="position:absolute; width:100%; height:100%; object-fit:cover;">
          <img src="${removedBgUrl || preview.querySelector('img')?.src}" style="position:absolute; width:100%; height:100%; object-fit:contain;">
        </div>`;
    };
    reader.readAsDataURL(customBg);
  } else {
    preview.innerHTML = `
      <div style="width:200px; height:260px; background:${color};">
        <img src="${removedBgUrl || preview.querySelector('img')?.src}" style="width:100%; height:100%; object-fit:contain;">
      </div>`;
  }
})
