import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { Garment, Scenario } from '../types'
import { Modal } from './Modal'
import { buildPrompt } from '../lib/prompt'
import { computeAgeLabel } from '../lib/age'



interface PromptModalProps {
  scenario: Scenario
  onClose: () => void
}

export function PromptModal({ scenario, onClose }: PromptModalProps) {
  const garments = useLiveQuery(() => db.garments.toArray(), [])
  const settings = useLiveQuery(async () => {
    const s = await db.settings.get('app')
    return s ?? { key: 'app' as const }
  }, [])

  return (
    <Modal open title={`Промт: ${scenario.name}`} onClose={onClose}>
      {garments === undefined || settings === undefined ? (
        <p className="text-sm text-slate-400">Загрузка…</p>
      ) : (
        <PromptContent
          scenario={scenario}
          garments={garments}
          ageLabel={
            settings.childBirthDate ? computeAgeLabel(settings.childBirthDate) : undefined
          }
        />
      )}
    </Modal>
  )
}


function PromptContent({
  scenario,
  garments,
  ageLabel,
}: {
  scenario: Scenario
  garments: Garment[]
  ageLabel?: string
}) {
  const [text, setText] = useState(() => buildPrompt(scenario, garments, ageLabel))
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const googleAIUrl = `https://www.google.com/search?udm=50&q=${encodeURIComponent(text)}`;
  const deepSeekUrl = `https://chat.deepseek.com/?q=${encodeURIComponent(text)}`;

  function openInNewTab(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
// Внутри PromptContent, рядом с handleCopy
async function handleShare() {
    const shareData = {
      title: `Промт: ${scenario.name}`,
      text: text, // текущий отредактированный текст из textarea
    };
  
    // Основной путь: Web Share API (мобильные браузеры, Safari, Chrome на Android)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Пользователь поделился — можно показать лёгкий тост, если хотите
      } catch (err) {
        // Если пользователь отменил диалог (AbortError) — это не ошибка
        if ((err as Error).name !== 'AbortError') {
          // При реальной ошибке — откатываемся на копирование
          await handleCopy();
        }
      }
      return;
    }
  
    // Fallback для десктопа или старых браузеров
    await handleCopy();
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Промт можно отредактировать перед копированием.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input min-h-[300px] font-mono text-xs"
      />
      <div className="grid grid-cols-2 gap-2">
  <button
    onClick={() => openInNewTab(googleAIUrl)}
    className="py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm"
  >
    Спросить Google AI
  </button>
  <button
    onClick={() => openInNewTab(deepSeekUrl)}
    className="py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm"
  >
    Спросить DeepSeek
  </button>
</div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 bg-slate-900 text-white py-2.5 rounded-lg font-medium"
        >
          {copied ? 'Скопировано ✓' : 'Скопировать'}
        </button>
        <button
  onClick={handleShare}
  className="px-3 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm"
  title="Поделиться"
>
  Поделиться
</button>
        <button
          onClick={() => setText(buildPrompt(scenario, garments, ageLabel))}
          className="px-3 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-sm"
          title="Вернуть исходный текст"
        >
          Сброс
        </button>
      </div>
    </div>
  )
}