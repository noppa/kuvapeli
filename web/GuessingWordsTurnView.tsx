import { useContext } from "solid-js"
import { PlayerDataContext } from "./resources/getDataResource"

export default function GuessingWordsTurnView() {
	const data = useContext(PlayerDataContext)
	console.log('woop', data)
	return 'guessing'
}