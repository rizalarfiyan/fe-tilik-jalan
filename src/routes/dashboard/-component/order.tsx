import { Button } from '@components/ui/button'
import useDebounce from '@hooks/use-debounce'
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from 'lucide-react'
import * as React from 'react'
import { Route } from '../index'

function Search() {
	const navigate = Route.useNavigate()
	const param = Route.useSearch()
	const [isDescending, setIsDescending] = React.useState(param.order === 'desc')
	const debounce = useDebounce(isDescending, 200)

	React.useEffect(() => {
		navigate({
			search: (prev) => ({
				...prev,
				order: debounce ? 'desc' : undefined,
			}),
		})
	}, [debounce, navigate])

	const onChangeSort = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		setIsDescending((prev) => !prev)
	}

	return (
		<Button
			variant="outline"
			type="button"
			size="icon"
			className="flex-shrink-0"
			onClick={onChangeSort}
		>
			{isDescending ? <ArrowUpNarrowWide /> : <ArrowDownNarrowWide />}
		</Button>
	)
}

export default Search
