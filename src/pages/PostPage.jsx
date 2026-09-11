import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { categories } from '../data/mockData'
import { areaGroups } from '../data/areas'
import { createItem, updateItem, getItemById } from '../services/firebaseService'

function Icon({ path, className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  )
}

const MAX_IMAGES = 5

const initialForm = {
  title: '',
  description: '',
  privateDetails: '',
  category: 'Electronics',
  type: 'lost',
  location: '',
  landmark: '',
  date: '',
  contactEmail: '',
  contactPhone: '',
  imageFiles: [],
  hasReward: false,
  rewardAmount: '',
  rewardNote: '',
}

export default function PostPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingItem, setFetchingItem] = useState(isEditMode)
  const [imagePreviews, setImagePreviews] = useState([]) // previews for newly picked files, same order as form.imageFiles
  const [existingImageUrls, setExistingImageUrls] = useState([]) // images already on the listing (edit mode)
  const [locationGroup, setLocationGroup] = useState('')

  useEffect(() => {
    if (!isEditMode) return

    const loadItem = async () => {
      try {
        const item = await getItemById(id)

        if (!item) {
          setError('Listing not found.')
          return
        }
        if (item.userId !== user?.uid) {
          navigate('/profile')
          return
        }

        setForm({
          title: item.title || '',
          description: item.description || '',
          privateDetails: item.privateDetails || '',
          category: item.category || 'Electronics',
          type: item.type || 'lost',
          location: item.location || '',
          landmark: item.landmark || '',
          date: item.dateOccurred ? item.dateOccurred.slice(0, 10) : '',
          contactEmail: item.contact?.maskedEmail || '',
          contactPhone: item.contact?.maskedPhone || '',
          imageFiles: [],
          hasReward: item.hasReward || false,
          rewardAmount: item.rewardAmount || '',
          rewardNote: item.rewardNote || '',
        })
        const matchedGroup = areaGroups.find((g) => g.options.includes(item.location))
        setLocationGroup(matchedGroup?.label || '')
        const existing = item.imageUrls && item.imageUrls.length > 0
          ? item.imageUrls
          : (item.image || item.imageUrl ? [item.image || item.imageUrl] : [])
        setExistingImageUrls(existing)
      } catch (err) {
        setError(err.message || 'Failed to load listing.')
      } finally {
        setFetchingItem(false)
      }
    }

    loadItem()
  }, [id, isEditMode, user?.uid, navigate])

  const handleChange = (event) => {
    const { name, value, type, files, checked } = event.target

    if (type === 'file') {
      const picked = Array.from(files || [])
      if (picked.length === 0) return

      const roomLeft = Math.max(0, MAX_IMAGES - existingImageUrls.length - form.imageFiles.length)
      const accepted = picked.slice(0, roomLeft)
      const newPreviews = accepted.map((file) => URL.createObjectURL(file))

      setImagePreviews((prev) => [...prev, ...newPreviews])
      setForm((prev) => ({ ...prev, imageFiles: [...prev.imageFiles, ...accepted] }))
      event.target.value = '' // allow picking the same file again later
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else if (name === 'rewardAmount') {
      // Strip anything that isn't a digit or decimal point — the RM
      // prefix is shown separately, so the stored value stays numeric.
      const cleaned = value.replace(/[^0-9.]/g, '')
      setForm((prev) => ({ ...prev, rewardAmount: cleaned }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleRemoveNewImage = (index) => {
    setForm((prev) => ({ ...prev, imageFiles: prev.imageFiles.filter((_, i) => i !== index) }))
    setImagePreviews((prev) => {
      const url = prev[index]
      if (url) URL.revokeObjectURL(url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleRemoveExistingImage = (index) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const totalImageCount = existingImageUrls.length + form.imageFiles.length

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!form.title.trim()) throw new Error('Title is required.')
      if (!form.description.trim()) throw new Error('Description is required.')
      if (!form.location.trim()) throw new Error('Location is required.')
      if (!form.date) throw new Error('Date is required.')
      if (form.type === 'found' && !form.privateDetails.trim()) {
        throw new Error('Add a private verification detail before posting a found item.')
      }
      if (!form.contactEmail.trim() && !form.contactPhone.trim()) {
        throw new Error('At least one contact method is required.')
      }
      if (form.hasReward && !form.rewardAmount.trim()) {
        throw new Error('Enter a reward amount, or turn off the reward toggle.')
      }

      const payload = {
        title: form.title,
        description: form.description,
        privateDetails: form.privateDetails,
        category: form.category,
        type: form.type,
        location: form.location,
        landmark: form.landmark,
        dateOccurred: form.date,
        imageFiles: form.imageFiles,
        hasReward: form.hasReward,
        rewardAmount: form.rewardAmount,
        rewardNote: form.rewardNote,
        contact: {
          preferredMethod: form.contactEmail ? 'email' : 'phone',
          maskedEmail: form.contactEmail || null,
          maskedPhone: form.contactPhone || null,
        },
      }

      if (isEditMode) {
        await updateItem(id, { ...payload, existingImageUrls })
        navigate(`/items/${id}`)
      } else {
        const newId = await createItem({ userId: user.uid, ...payload })
        navigate(`/items/${newId}`)
      }
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} listing.`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => navigate(isEditMode ? `/items/${id}` : '/')

  if (fetchingItem) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <p className="text-ink-soft">Loading listing…</p>
      </div>
    )
  }

  return (
    <div className="post-page min-h-screen">
      <div className="post-header border-b border-ink/10">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-black text-cream">{isEditMode ? 'Edit listing' : 'Post a listing'}</h1>
          <p className="mt-2 text-sm text-cream/70">{isEditMode ? 'Update the details of your listing' : 'Report a lost item or a found item to the community'}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="post-form-card p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Item Type — toggle style */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">Listing type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: 'lost' }))}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    form.type === 'lost'
                      ? 'border-coral bg-coral/10 text-coral'
                      : 'border-ink/10 text-ink-soft hover:border-ink/15'
                  }`}
                >
                  <Icon path={<><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>} />
                  I lost something
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: 'found' }))}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                    form.type === 'found'
                      ? 'border-sage bg-sage/10 text-sage'
                      : 'border-ink/10 text-ink-soft hover:border-ink/15'
                  }`}
                >
                  <Icon path={<polyline points="20 6 9 17 4 12" />} />
                  I found something
                </button>
              </div>
            </div>

            {/* Reward — only for lost items */}
            {form.type === 'lost' && (
              <div className="rounded-lg border border-ink/10 bg-surface-soft/40 p-4">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasReward"
                    checked={form.hasReward}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-ink/30 text-amber focus:ring-amber/40"
                  />
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Icon className="h-4 w-4 text-amber-dark" path={<><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></>} />
                    Offer a reward
                  </span>
                </label>

                {form.hasReward && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">Reward amount *</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-semibold text-ink-soft">
                          RM
                        </span>
                        <input
                          name="rewardAmount"
                          value={form.rewardAmount}
                          onChange={handleChange}
                          type="text"
                          inputMode="decimal"
                          className="w-full rounded-lg border border-ink/15 bg-surface pl-10 pr-3.5 py-2.5 text-sm text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                          placeholder="50"
                          required={form.hasReward}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink mb-1.5">Note (optional)</label>
                      <input
                        name="rewardNote"
                        value={form.rewardNote}
                        onChange={handleChange}
                        type="text"
                        className="w-full rounded-lg border border-ink/15 bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                        placeholder="e.g. No questions asked"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                type="text"
                className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                placeholder="e.g. Blue leather wallet with gold chain"
                required
              />
            </div>

            {/* Description — public */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-ink mb-1.5">
                <Icon className="h-3.5 w-3.5 text-ink-soft" path={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>} />
                Public description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                placeholder={
                  form.type === 'found'
                    ? 'General description only — e.g. dark brown leather wallet, small scratch on the corner'
                    : 'Include specific details: color, brand, distinctive marks, where it was last seen…'
                }
                required
              />
              <p className="mt-1 text-xs text-ink-soft">
                {form.type === 'found'
                  ? 'Everyone can see this. Keep it general enough to help owners recognize the item, but don\u2019t include unique identifying details here.'
                  : 'More details help people identify and reunite items with you.'}
              </p>
            </div>

            {/* Private details — only for found */}
            {form.type === 'found' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-amber-900 mb-1.5">
                  <Icon className="h-3.5 w-3.5" path={<><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>} />
                  Private verification detail *
                </label>
                <textarea
                  name="privateDetails"
                  value={form.privateDetails}
                  onChange={handleChange}
                  rows="2"
                  className="w-full rounded-lg border border-amber-300 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                  placeholder="e.g. Contents inside, a specific scratch location, or something only the real owner would know"
                  required
                />
                <p className="mt-1.5 text-xs text-amber-800">
                  This stays hidden from the public listing. Use it to verify the real owner when they contact you — never share it upfront.
                </p>
              </div>
            )}

            {/* Location & Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Area category *</label>
                <select
                  value={locationGroup}
                  onChange={(e) => {
                    setLocationGroup(e.target.value)
                    setForm((prev) => ({ ...prev, location: '' }))
                  }}
                  className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                  required
                >
                  <option value="" disabled>Select a category…</option>
                  {areaGroups.map((group) => (
                    <option key={group.label} value={group.label}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Date *</label>
                <input
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  type="date"
                  className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                  required
                />
              </div>
            </div>

            {locationGroup && (
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Area *</label>
                <select
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                  required
                >
                  <option value="" disabled>Select a specific area…</option>
                  {areaGroups.find((g) => g.label === locationGroup)?.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Landmark — optional specific detail within the chosen area */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Landmark <span className="font-normal text-ink-soft">(optional)</span></label>
              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                type="text"
                className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                placeholder="e.g. 2nd floor, near the printer"
              />
              <p className="mt-1 text-xs text-ink-soft">Helps others pinpoint it exactly within the area you picked.</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Photos (optional, up to {MAX_IMAGES})</label>

              {totalImageCount > 0 && (
                <div className="mb-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {existingImageUrls.map((url, i) => (
                    <div key={`existing-${i}`} className="relative rounded-lg overflow-hidden border border-ink/10 aspect-square">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(i)}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy/80 text-cream hover:bg-coral transition"
                        aria-label="Remove image"
                      >
                        <Icon className="h-3.5 w-3.5" path={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative rounded-lg overflow-hidden border border-ink/10 aspect-square">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(i)}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-navy/80 text-cream hover:bg-coral transition"
                        aria-label="Remove image"
                      >
                        <Icon className="h-3.5 w-3.5" path={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {totalImageCount < MAX_IMAGES ? (
                <div className="grid grid-cols-2 gap-2">
                  <label
                    htmlFor="image-camera"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-ink/15 bg-surface-soft py-5 text-center hover:border-amber hover:bg-amber/10 transition"
                  >
                    <Icon className="h-6 w-6 text-ink-soft" path={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>} />
                    <span className="text-xs font-semibold text-ink">Take photo</span>
                    <input
                      id="image-camera"
                      name="image"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>

                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-ink/15 bg-surface-soft py-5 text-center hover:border-amber hover:bg-amber/10 transition"
                  >
                    <Icon className="h-6 w-6 text-ink-soft" path={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></>} />
                    <span className="text-xs font-semibold text-ink">Choose from gallery</span>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <p className="text-xs text-ink-soft">Maximum of {MAX_IMAGES} photos reached. Remove one to add another.</p>
              )}
              <p className="mt-1.5 text-xs text-ink-soft">JPG, PNG or WEBP up to 5MB each</p>
            </div>

            {/* Contact Methods */}
            <div className="rounded-lg bg-surface-soft p-4 border border-ink/10">
              <h3 className="text-sm font-semibold text-ink mb-1">Contact information</h3>
              <p className="text-xs text-ink-soft mb-3">Provide at least one way for people to reach you (hidden for privacy)</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1">Email</label>
                  <input
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    type="email"
                    className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1">Phone</label>
                  <input
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    type="tel"
                    className="w-full rounded-lg border border-ink/15 bg-surface text-ink px-3.5 py-2.5 text-sm focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition"
                    placeholder="012-345 6789"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-coral/30 bg-coral/10 px-3.5 py-2.5">
                <Icon className="h-4 w-4 text-coral mt-0.5 flex-shrink-0" path={<><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>} />
                <p className="text-sm text-coral">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink/10">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-soft transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-navy hover:bg-amber-dark disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loading ? (isEditMode ? 'Saving…' : 'Posting…') : (isEditMode ? 'Save changes' : 'Post listing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}