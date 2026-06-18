'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ApprovalQueue } from '@/lib/types/approval'

export default function ApprovalsPage() {
  const supabase = createClient()

  const [approvals, setApprovals] = useState<ApprovalQueue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')

  const fetchApprovals = async () => {
    setLoading(true)
    try {
      let query = supabase.from('approval_queue').select('*')

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching approvals:', error)
        return
      }

      setApprovals(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  async function handleApprove(id: string) {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, decision: 'approved' }),
      })

      if (!response.ok) {
        alert('承認に失敗しました')
        return
      }

      alert('承認しました')
      fetchApprovals()
    } catch (error) {
      console.error('Error approving:', error)
      alert('エラーが発生しました')
    }
  }

  async function handleReject(id: string) {
    try {
      const response = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, decision: 'rejected' }),
      })

      if (!response.ok) {
        alert('却下に失敗しました')
        return
      }

      alert('却下しました')
      fetchApprovals()
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('エラーが発生しました')
    }
  }

  async function handleBulkApprove() {
    if (selectedIds.size === 0) {
      alert('承認対象を選択してください')
      return
    }

    for (const id of selectedIds) {
      await handleApprove(id)
    }

    setSelectedIds(new Set())
  }

  function getKindLabel(kind: string): string {
    const labels: Record<string, string> = {
      sns_post: '📱 SNS投稿',
      nurture_msg: '📧 フォロー送信',
      outbound: '🔗 外部連携',
      product_push: '🛍️ 商品プッシュ',
    }
    return labels[kind] || kind
  }

  function getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      pending: '⏳ 待機中',
      approved: '✅ 承認済',
      rejected: '❌ 却下',
    }
    return badges[status] || status
  }

  function getLintBadge(lint: string): string {
    return lint === 'pass' ? '✅ Pass' : '⚠️ Flag'
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: 'linear-gradient(135deg, #d4a955 0%, #c99a4a 100%)',
          boxShadow: '0 8px 16px rgba(212, 169, 85, 0.2)',
        }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">🔔 承認待機</h1>
        <p className="text-white/90">管理者承認が必要な項目を確認・処理します</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: '#f0f0f0',
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.7)',
          }}
        >
          <div className="text-2xl font-bold text-blue-600">
            {approvals.filter((a) => a.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">待機中</div>
        </div>

        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: '#f0f0f0',
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.7)',
          }}
        >
          <div className="text-2xl font-bold text-green-600">
            {approvals.filter((a) => a.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">承認済</div>
        </div>

        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: '#f0f0f0',
            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.7)',
          }}
        >
          <div className="text-2xl font-bold text-red-600">
            {approvals.filter((a) => a.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">却下</div>
        </div>
      </div>

      {/* Filters + Actions */}
      <div className="flex gap-3 mb-6">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {f === 'pending'
              ? '待機中'
              : f === 'approved'
                ? '承認済'
                : f === 'rejected'
                  ? '却下'
                  : 'すべて'}
          </button>
        ))}

        {filter === 'pending' && selectedIds.size > 0 && (
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white shadow-md hover:bg-green-700"
          >
            一括承認 ({selectedIds.size})
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">承認待機項目がありません</div>
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="rounded-xl p-4"
              style={{
                background: '#f9f9f9',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                {approval.status === 'pending' && (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(approval.id)}
                    onChange={(e) => {
                      const newIds = new Set(selectedIds)
                      if (e.target.checked) {
                        newIds.add(approval.id)
                      } else {
                        newIds.delete(approval.id)
                      }
                      setSelectedIds(newIds)
                    }}
                    className="mt-1"
                  />
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg">
                      {getKindLabel(approval.kind)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-200">
                      {getStatusBadge(approval.status)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100">
                      {getLintBadge(approval.lint_status)}
                    </span>
                  </div>

                  {/* Payload Preview */}
                  <div className="text-sm text-gray-600 mb-2">
                    {approval.kind === 'sns_post' && (
                      <div>
                        📌 {String(approval.payload?.site)}/{String(approval.payload?.platform)} •{' '}
                        {String(approval.payload?.caption || '').substring(0, 50)}
                        {String(approval.payload?.caption || '').length > 50 ? '...' : ''}
                      </div>
                    )}
                    {approval.kind === 'nurture_msg' && (
                      <div>
                        📌 {String(approval.payload?.channel)} • Step{' '}
                        {String(approval.payload?.sequence_step || '-')}
                      </div>
                    )}
                    {approval.kind === 'outbound' && (
                      <div>
                        📌 {String(approval.payload?.outbound_type)} •{' '}
                        {String(approval.payload?.webhook_url || approval.payload?.target)}
                      </div>
                    )}
                    {approval.kind === 'product_push' && (
                      <div>
                        📌 {String(approval.payload?.product_id)} •{' '}
                        {String(approval.payload?.target_segment)}
                      </div>
                    )}
                  </div>

                  {/* Lint Notes */}
                  {approval.lint_status === 'flag' && approval.lint_notes && (
                    <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded mb-2">
                      ⚠️ {approval.lint_notes}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500">
                    {new Date(approval.created_at).toLocaleString('ja-JP')}
                  </div>
                </div>

                {/* Actions */}
                {approval.status === 'pending' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white text-sm hover:bg-green-700"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      却下
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
