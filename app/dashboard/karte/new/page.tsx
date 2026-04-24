'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewKartePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: '',
    notes: '',
  })
  const [photos, setPhotos] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setMessage(null)

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage({ ok: false, text: 'ログインが必要です' })
        setUploading(false)
        return
      }

      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`

        const { error } = await supabase.storage
          .from('karte-photos')
          .upload(fileName, file, { cacheControl: '3600', upsert: false })

        if (error) {
          setMessage({ ok: false, text: 'アップロードエラー: ' + error.message })
          setUploading(false)
          return
        }

        const { data: publicUrl } = supabase.storage
          .from('karte-photos')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl.publicUrl)
      }

      setPhotos([...photos, ...uploadedUrls])
      setUploading(false)
    } catch (err: any) {
      setMessage({ ok: false, text: 'エラー: ' + err.message })
      setUploading(false)
    }
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage({ ok: false, text: 'ログインが必要です' })
        setLoading(false)
        return
      }

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_user_id', user.id)
        .maybeSingle()

      if (!salon) {
        setMessage({ ok: false, text: 'サロン情報が取得できません' })
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('customers')
        .insert({
          salon_id: salon.id,
          name: formData.name,
          phone: formData.phone || null,
          email: formData.email || null,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          notes: formData.notes || null,
          photos: photos,
          visit_count: 0,
          total_spent: 0,
        })

      if (error) {
        setMessage({ ok: false, text: '登録エラー: ' + error.message })
        setLoading(false)
        return
      }

      setMessage({ ok: true, text: '登録完了' })
      setTimeout(() => router.push('/dashboard/karte'), 1000)
    } catch (err: any) {
      setMessage({ ok: false, text: 'エラー: ' + err.message })
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: '40px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, letterSpacing: 4, color: '#1A1018', margin: 0 }}>
          新規カルテ
        </h1>
        <Link
          href="/dashboard/karte"
          style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #1A1018', color: '#1A1018', textDecoration: 'none', fontSize: 13 }}
        >
          ← 戻る
        </Link>
      </div>

      {message && (
        <div style={{
          padding: 12, borderRadius: 6,
          background: message.ok ? '#e6f4ea' : '#fce8e6',
          color: message.ok ? '#1e8e3e' : '#c5221f',
          marginBottom: 20, fontSize: 14,
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>お名前 *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
            style={{ width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14 }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>電話番号</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
            style={{ width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14 }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>メールアドレス</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange}
            style={{ width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>年齢</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} min="0" max="150"
              style={{ width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>性別</label>
            <select name="gender" value={formData.gender} onChange={handleChange}
              style={{ width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, background: '#fff' }}>
              <option value="">選択</option>
              <option value="female">女性</option>
              <option value="male">男性</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
            写真（施術前・後・ヘアスタイル等）
          </label>
          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading}
            style={{ width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, background: '#fafafa' }} />
          {uploading && <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>アップロード中...</p>}
          {photos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
              {photos.map((url, index) => (
                <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                  <img src={url} alt={`photo-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => handleRemovePhoto(index)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>メモ</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4}
            style={{ width: '100%', padding: 12, border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <button type="submit" disabled={loading || uploading}
          style={{
            width: '100%', padding: 14, borderRadius: 8,
            background: '#1A1018', color: '#FAF6EE', border: 'none', fontSize: 14,
            cursor: (loading || uploading) ? 'not-allowed' : 'pointer',
            opacity: (loading || uploading) ? 0.6 : 1,
          }}>
          {loading ? '登録中...' : 'カルテを登録'}
        </button>
      </form>
    </main>
  )
}
