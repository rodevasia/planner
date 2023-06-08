import { TaskStatus } from '@renderer/models/Tasks'
import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from 'solid-bootstrap'
import { createEffect, createSignal } from 'solid-js'

dayjs.extend(duration)
dayjs.extend(relativeTime)

function TimeTracker(props: {
  onStart: (status: string) => void
  onStop: (time: number, status: string) => void
  onPause: (time: number, status: string) => void
  initialDuration: number
  status: string
}) {
  const [startTime, setStartTime] = createSignal<Dayjs | null>(null)
  const [elapsedTime, setElapsedTime] = createSignal(
    dayjs.duration(props.initialDuration, 'milliseconds')
  )
  const [isRunning, setIsRunning] = createSignal(false)
  const [intervalId, setIntervalId] = createSignal<number | null>(null)
  const [status, setStatus] = createSignal(props.status)
  createEffect(() => {
    let timerId: number | null = null
    if (isRunning()) {
      timerId = window.setInterval(() => {
        setElapsedTime((prev) => dayjs.duration(dayjs().diff(startTime() as Dayjs)))
      }, 1000)
      setIntervalId(timerId)
    }

    return () => {
      clearInterval(intervalId() as number)
    }
  }, [isRunning, startTime])

  const handleStart = () => {
    if (isRunning()) return
    const now = dayjs()
    setStartTime(now.subtract(dayjs.duration(props.initialDuration, 'milliseconds')))
    setIsRunning(true)
    setStatus(TaskStatus.INPROGRESS)
    props.onStart(TaskStatus.INPROGRESS)
  }

  const handlePause = () => {
    clearInterval(intervalId() as number)
    setStartTime(null)
    setIsRunning(false)
    props.onPause(elapsedTime().asMilliseconds(), status())
  }

  const handleResume = () => {
    const now = dayjs()
    const timeElapsed = dayjs.duration(elapsedTime().asMilliseconds(), 'milliseconds')
    setStartTime(now.subtract(timeElapsed))
    setIsRunning(true)
  }

  const handleReset = () => {
    clearInterval(intervalId() as number)
    setElapsedTime((prev) => dayjs.duration(0))
    setStartTime(null)
    setIsRunning(false)
  }
  const handleStop = () => {
    clearInterval(intervalId() as number)
    setElapsedTime((prev) => dayjs.duration(0))
    setStartTime(null)
    setIsRunning(false)
    if (props.onStop) {
      props.onStop(elapsedTime().asMilliseconds(), status())
    }
  }
  return (
    <div class="d-flex w-100 h-100 justify-content-center align-items-center">
      {elapsedTime().asMilliseconds() > 0 && <h1>{elapsedTime().format('HH : mm : ss')}</h1>}
      {!isRunning() && elapsedTime().asMilliseconds() === 0 && (
        <Button onClick={handleStart}>Do this now</Button>
      )}
      {isRunning() && <i class="bi bi-pause fw-bold fs-1 mx-3" onClick={handlePause}></i>}
      {!isRunning() && elapsedTime().asMilliseconds() > 0 && (
        <i class="bi bi-play fw-bold fs-1 mx-3" onClick={handleResume}></i>
      )}
      {!isRunning() && elapsedTime().asMilliseconds() > 0 && (
        <i class="bi bi-stop fw-bold fs-1 mx-3" onClick={handleStop}></i>
      )}
      {elapsedTime().asMilliseconds() > 0 && (
        <i class="bi bi-arrow-clockwise fw-bold fs-3 mx-3" onClick={handleReset}></i>
      )}
    </div>
  )
}

export default TimeTracker
