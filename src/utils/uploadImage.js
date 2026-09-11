export async function uploadImageToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Check your .env file.')
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Image upload failed. Please try again.')
  }

  const data = await response.json()
  return data.secure_url
}