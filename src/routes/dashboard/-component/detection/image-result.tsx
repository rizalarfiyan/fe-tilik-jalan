import { Button } from '@/components/ui/button'
import type { IState } from '@components/state-object'
import StateObject from '@components/state-object'
import Typography from '@components/typography'
import { Badge } from '@components/ui/badge'
import useDetection from '@hooks/use-detection'
import RenderBox from '@lib/render-box'
import { calcAspectRatio, cn, fileSizeSI } from '@lib/utils'
import type { TotalResult } from '@lib/yolo'
import { X } from 'lucide-react'
import * as React from 'react'

interface ImageResultProps {
	file: File
	setFile: (file: File | null) => void
}

const ImageResult: React.FC<ImageResultProps> = ({ file, setFile }) => {
	const { model } = useDetection()
	const shape = model!.shape()

	const canvasRef = React.useRef<HTMLCanvasElement>(null)
	const imageRef = React.useRef<HTMLImageElement>(null)
	const objectRef = React.useRef<TotalResult[] | null>(null)
	const [state, setState] = React.useState<IState | null>({
		loading: true,
	})

	const detect = async () => {
		const canvas = canvasRef.current
		const img = imageRef.current
		if (!model || !canvas || !img) return
		try {
			await model.detect(img, {
				results: (results) => {
					objectRef.current = results
				},
				renderBox: (prediction) =>
					new RenderBox({
						canvas,
						...prediction,
					}).build({
						fill: true,
						label: true,
					}),
			})
			setState(null)
		} catch (err) {
			// biome-ignore lint/suspicious/noExplicitAny: error is not an instance of Error
			console.warn('Error detect image: ', (err as any).toString())
			setState({
				error: 'Failed to detect object.',
			})
		}
	}

	const { objects, tables } = React.useMemo(() => {
		const width = imageRef.current?.naturalWidth ?? 0
		const height = imageRef.current?.naturalHeight ?? 0

		return {
			objects: {
				value: objectRef.current,
				total: objectRef.current?.reduce((acc, { total }) => acc + total, 0),
			},
			tables: [
				{
					id: 1,
					label: 'File Name',
					value: file.name,
				},
				{
					id: 2,
					label: 'Type',
					value: file.type,
				},
				{
					id: 3,
					label: 'Size',
					value: fileSizeSI(file.size),
				},
				{
					id: 4,
					label: 'Resolution',
					value: state?.loading ? null : `${width}x${height}`,
				},
				{
					id: 5,
					label: 'Aspect Ratio',
					value: state?.loading ? null : calcAspectRatio(width, height, ':'),
				},
			],
		}
	}, [state, file])

	const onImageLoad = () => {
		if (!imageRef.current || state === null) return
		const timeout = setTimeout(() => {
			clearTimeout(timeout)
			detect()
		}, 25)
	}

	const removeImage = () => {
		imageRef.current = null
		setFile(null)
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')!
		ctx.clearRect(0, 0, canvas.width, canvas.height)
	}

	return (
		<div className="flex gap-6">
			<div className="relative max-w-3xl rounded-md border-2 border-dashed p-3">
				<div className="relative w-full overflow-hidden">
					<img
						ref={imageRef}
						src={URL.createObjectURL(file)}
						alt="Uploaded detection object"
						onLoad={onImageLoad}
						className="h-auto w-full rounded-md"
					/>
					<canvas
						ref={canvasRef}
						width={shape[1]}
						height={shape[2]}
						className="absolute inset-0 h-full w-full"
					/>
				</div>
				<Button
					size="icon"
					className="absolute top-6 right-6"
					onClick={(e) => {
						e.stopPropagation()
						removeImage()
					}}
				>
					<X className="size-5" />
				</Button>
				<StateObject state={state} />
			</div>
			<div className="mt-4 space-y-4">
				<Typography variant="h4" className="text-center">
					Detection results:
				</Typography>
				<div className="flex flex-col items-center justify-between gap-6">
					<table className="w-full">
						<tbody>
							{tables.map(({ id, label, value }) => {
								const val = value ? (
									value
								) : (
									<span className="text-slate-400">Loading...</span>
								)
								return (
									<tr key={id} className="px-2">
										<td className="w-32 py-1 pl-3 font-semibold">{label}</td>
										<td className="px-2 py-1">:</td>
										<td className="line-clamp-2 py-1 pr-3">{val}</td>
									</tr>
								)
							})}
						</tbody>
					</table>
					<div className="w-full max-w-sm space-y-5 text-center">
						<div className="font-semibold">Objects: {objects.total}</div>
						{!objects.value || objects.value?.length <= 0 ? (
							<div
								className={cn(
									'inline-block rounded-md border bg-slate-50 px-5 py-3 text-sm',
									objects.value !== null &&
										'border-red-300 bg-red-50 text-red-600',
								)}
							>
								{objects.value !== null
									? 'No object detected.'
									: 'Loading object...'}
							</div>
						) : (
							<div className="flex flex-wrap items-center justify-center gap-2">
								{objects.value.map(
									({ total, class: { color, foreground, label } }) => (
										<Badge
											variant="outline"
											className="flex items-center gap-2 px-2 py-1 pl-3"
											key={label}
										>
											<div className="font-semibold">{label}</div>
											<div
												className="rounded-full px-1.5 py-0.5"
												style={{
													backgroundColor: color,
													color: foreground,
												}}
											>
												{total}
											</div>
										</Badge>
									),
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default ImageResult
