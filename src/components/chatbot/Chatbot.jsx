import { useState } from 'react'
import ChatbotButton from './ChatbotButton'
import ChatbotModal from './ChatbotModal'

export default function Chatbot() {
  const [open, setOpen] = useState(false)

  // The admin check that used to live here read window.location directly, so
  // it never re-evaluated on navigation. App decides where this mounts now.
  return (
    <>
      <ChatbotButton open={open} onClick={() => setOpen(o => !o)} />
      <ChatbotModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
