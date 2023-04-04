<template>
    <div class="mx-auto flex flex-col items-center bg-gray-100 p-4 min-h-screen">
        <div class="container">
            <div class="w-full my-4"></div>
            <add-ticker @add-ticker="add"
                        :addedTickers="tickers"
                        :disabled="toManyTisckersAdded"
            />
            <template v-if="filteredTickers.length > 0">
                <hr class="w-full border-t border-gray-600 my-4"/>
                <section>
                    <div class="flex justify-center align-center">
                        <input v-model="filter"
                               placeholder="You filter"
                               type="text"
                               class="block pr-10 w-full border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                        />
                    </div>
                </section>
                <div v-if="filteredTickers.length > 6"
                     class="flex justify-center mt-4"
                >
                    <button @click="prevPage"
                            aria-label="Prev"
                            class="mr-5 my-4 inline-flex tems-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Prev
                    </button>
                    <button @click="nextPage"
                            aria-label="Next"
                            class="mr-5 my-4 inline-flex tems-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Next
                    </button>
                </div>
                <hr class="w-full border-t border-gray-600 my-4"/>
                <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div v-for="t in paginationTickers"
                         :key="t.name"
                         @click="t.isValid === true ? select(t) : null"
                         :class="{'border-4': true,'border-purple-800': selectedTicker === t, 'border-red-700': t.isValid === false}"
                         class="bg-white overflow-hidden shadow rounded-lg border-solid cursor-pointer"

                    >
                        <div class="px-4 py-5 sm:p-6 text-center">
                            <dt class="text-sm font-medium text-gray-500 truncate">
                                {{ t.name.toUpperCase() }} - USD
                            </dt>
                            <dd class="mt-1 text-3xl font-semibold text-gray-900">
                                {{ formatPrice(t.price) }}
                            </dd>
                        </div>
                        <div class="w-full border-t border-gray-200"></div>
                        <button @click.stop="removeTicker(t)"
                                aria-label="Remove"
                                class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
                        >
                            <svg class="h-5 w-5"
                                 xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 20 20"
                                 fill="#718096"
                                 aria-hidden="true"
                            >
                                <path fill-rule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clip-rule="evenodd"></path>
                            </svg>
                            Remove
                        </button>
                    </div>
                </dl>
                <hr class="w-full border-t border-gray-600 my-4"/>
            </template>
            <add-graph :selectedTickerData="selectedTicker"
                       @close-graph="selectedTicker = null"
                       :graphData="graph"
            />
        </div>
    </div>
</template>

<script>
import { subscribeToTicker, unsubscribeFromTicker } from './api'
import AddTicker from './components/AddTicker.vue'
import AddGraph from './components/AddGraph.vue'

export default {
	name: 'App',

	components: {
		AddTicker,
		AddGraph
	},

	data: () => ({
		filter: '',
		tickers: [
			{name: 'BTC', price: '-', isValid: true},
			{name: 'TESLA', price: '-', isValid: true},
			{name: 'ETH', price: '-', isValid: true},
			{name: 'QTL', price: '-', isValid: true},
			{name: 'DOGE', price: '-', isValid: true},
			{name: 'CASH', price: '-', isValid: true},
			{name: 'DANK', price: '-', isValid: true}
		],
		selectedTicker: null,
		graph: [],
		page: 1
	}),

	created() {
		const windowData = Object.fromEntries(
			new URL(window.location).searchParams.entries()
		)

		if (windowData.filter) {
			this.filter = windowData.filter
		}

		if (windowData.page) {
			this.page = Number.parseInt(windowData.page)
		}

		let tickersData = JSON.parse(localStorage.getItem('tickers'))

		if (tickersData) {
			this.tickers = tickersData
		} else {
			this.tickers = [...this.tickers]
		}
		this.tickers.forEach((ticker) => {
			subscribeToTicker(ticker.name, (newPrice) =>
				this.updateTicker(ticker.name, newPrice)
			)
		})

		setInterval(this.updateTicker, 3000)
	},

	computed: {
		toManyTisckersAdded() {
			return this.tickers.length > 17
		},
		hasNextPage() {
			return this.filteredTickers.length > this.endIndex
		},

		startIndex() {
			return (this.page - 1) * 6
		},

		endIndex() {
			return this.page * 6
		},

		filteredTickers() {
			return this.tickers.filter((t) =>
				t.name.toLowerCase().includes(this.filter.toLowerCase())
			)
		},

		paginationTickers() {
			return this.filteredTickers.slice(this.startIndex, this.endIndex)
		},

		pageStateOptions() {
			return {
				filter: this.filter,
				page: this.page
			}
		}
	},

	methods: {
		updateTicker(tickerName, price) {
			this.tickers
				.filter((t) => t.name === tickerName)
				.forEach((t) => {
					if (t === this.selectedTicker) {
						this.graph.push(price)
						while (this.graph.length > this.maxGraphElements) {
							this.graph.shift()
							this.calculateMaxGraphElements()
						}
					}
					t.price = price
				})
		},

		add(ticker, isValid) {
			if (ticker != '') {
				const curentTicker = {
					name: ticker.toUpperCase(),
					price: '-',
					isValid: isValid
				}

				this.tickers = [...this.tickers, curentTicker]

				subscribeToTicker(curentTicker.name, (newPrice) =>
					this.updateTicker(curentTicker.name, newPrice)
				)
			}
		},

		formatPrice(price) {
			if (price === '-') {
				return price
			}
			return price > 1 ? price.toFixed(2) : price.toPrecision(2)
		},

		removeTicker(tickerToRemove) {
			this.tickers = this.tickers.filter((t) => t != tickerToRemove)
			if (this.selectedTicker === tickerToRemove) {
				this.selectedTicker = null
			}
			unsubscribeFromTicker(tickerToRemove)
		},

		nextPage() {
			if (this.hasNextPage) {
				return (this.page += 1)
			}
		},

		prevPage() {
			if (this.page > 1) {
				return (this.page -= 1)
			}
		},

		select(ticker) {
			this.selectedTicker = ticker
		}
	},

	watch: {
		filter() {
			this.page = 1
		},

		selectedTicker() {
			this.graph = []
		},

		tickers() {
			localStorage.setItem('tickers', JSON.stringify(this.tickers))
		},

		paginationTickers() {
			if (this.paginationTickers.length === 0 && this.page > 1) {
				this.page -= 1
			}
		},

		pageStateOptions(value) {
			window.history.pushState(
				null,
				document.title,
				`${window.location.pathname}?filter=${value.filter}&page=${value.page}`
			)
		}
	}
}
</script>

<style src="./app.css"></style>
