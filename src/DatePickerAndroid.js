/**
 * @typedef {import("../index").DatePickerProps} Props
 * @typedef {Omit<Props, "timeZoneOffsetInMinutes"> & { timeZoneOffsetInMinutes: string, textColor: string | undefined, onDateStringChange?: (date: string) => void }} PlatformPickerProps
 */
import React, { useCallback, useEffect, useRef } from 'react'
import { NativeEventEmitter } from 'react-native'
import { useModal } from './modal'
import { getNativeComponent, getNativeModule } from './modules'

const NativeComponent = getNativeComponent()
const NativeModule = getNativeModule()

const height = 180
const timeModeWidth = 240
const defaultWidth = 310

/** @type {React.FC<PlatformPickerProps>} */
export const DatePickerAndroid = React.memo((props) => {
  const thisId = useRef(Math.random().toString()).current

  const onChange = useCallback(
    /**
     * @typedef {{date: string, id: string, dateString: string}} Data
     * @param {{ nativeEvent: Data } | Data & { nativeEvent: undefined }} e
     */
    (e) => {
      const { date, id, dateString } = e.nativeEvent ?? e
      const newArch = id !== null
      if (newArch && id !== thisId) return
      const jsDate = fromIsoWithTimeZoneOffset(date)
      if (props.onDateChange) props.onDateChange(jsDate)
      if (props.onDateStringChange) props.onDateStringChange(dateString)
    },
    [props, thisId]
  )

  const onSpinnerStateChanged = useCallback(
    /**
     * @typedef {{ spinnerState: Parameters<Props['onStateChange']>[0], id: string }} SpinnerStateData
     * @param {{ nativeEvent: SpinnerStateData } | SpinnerStateData & { nativeEvent: undefined }} e
     */
    (e) => {
      const { spinnerState, id } = e.nativeEvent ?? e
      const newArch = id !== null
      if (newArch && id !== thisId) return
      props.onStateChange && props.onStateChange(spinnerState)
    },
    [props, thisId]
  )

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModule)
    eventEmitter.addListener('dateChange', onChange)
    eventEmitter.addListener('spinnerStateChange', onSpinnerStateChanged)
    return () => {
      eventEmitter.removeAllListeners('dateChange')
      eventEmitter.removeAllListeners('spinnerStateChange')
    }
  }, [onChange, onSpinnerStateChanged])

  useModal({ props, id: thisId })

  if (props.modal) return null

  return (
    <NativeComponent
      {...props}
      date={toIsoWithTimeZoneOffset(props.date)}
      id={thisId}
      minimumDate={toIsoWithTimeZoneOffset(props.minimumDate)}
      maximumDate={toIsoWithTimeZoneOffset(props.maximumDate)}
      timezoneOffsetInMinutes={getTimezoneOffsetInMinutes(props)}
      style={getStyle(props)}
      onChange={onChange}
      onStateChange={onSpinnerStateChanged}
    />
  )
})

/** @param {PlatformPickerProps} props */
const getStyle = (props) => {
  const width = props.mode === 'time' ? timeModeWidth : defaultWidth
  return [{ width, height }, props.style]
}

/** @param {PlatformPickerProps} props */
const getTimezoneOffsetInMinutes = (props) => {
  // eslint-disable-next-line eqeqeq
  if (props.timeZoneOffsetInMinutes == undefined) return undefined
  return props.timeZoneOffsetInMinutes
}

/**
 * @template {Date | undefined} T
 * @param {T} date
 * @returns {T extends Date ? string : undefined}
 * */
const toIsoWithTimeZoneOffset = (date) => {
  /** @ts-ignore */
  if (!date) return undefined
  /** @ts-ignore */
  return date.toISOString()
}

/** @param {string} timestamp */
const fromIsoWithTimeZoneOffset = (timestamp) => {
  return new Date(timestamp)
}

export default DatePickerAndroid
