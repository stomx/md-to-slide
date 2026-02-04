// components/OnboardingTutorial.tsx

'use client'

import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride'
import { useSlideStore } from '@/store/slide-store'

const steps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Markdown to Slide! Let me show you around.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '#markdown-editor',
    content:
      'This is the markdown editor. Write your slides using markdown syntax. Use --- for horizontal slides and ----- for vertical slides.',
    placement: 'right',
  },
  {
    target: '#slide-preview',
    content:
      'Your slides will appear here in real-time as you type. It updates automatically with a 300ms debounce.',
    placement: 'left',
  },
  {
    target: '#theme-selector',
    content:
      'Choose from 12 reveal.js themes to customize your presentation style.',
    placement: 'bottom',
  },
  {
    target: '#export-buttons',
    content:
      'Export your slides as PDF (using browser print) or standalone HTML file.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content:
      'Press Cmd+K to see all keyboard shortcuts, or Cmd+? for detailed help. Happy presenting!',
    placement: 'center',
  },
]

export const OnboardingTutorial = () => {
  const { hasSeenOnboarding, setHasSeenOnboarding } = useSlideStore()

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setHasSeenOnboarding(true)
    }
  }

  return (
    <Joyride
      steps={steps}
      run={!hasSeenOnboarding}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb',
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          zIndex: 10000,
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          fontSize: '14px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6b7280',
          fontSize: '14px',
        },
        buttonSkip: {
          color: '#9ca3af',
          fontSize: '14px',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip',
      }}
    />
  )
}
