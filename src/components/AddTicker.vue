<template>
	<section>
		<div class="flex">
			<div class="max-w-xs">
				<label
					for="wallet"
					class="block text-sm font-medium text-gray-700"
					>Тикер</label
				>
				<div class="mt-1 relative rounded-md shadow-md">
					<input
						v-model="ticker"
						@keydown.enter="add()"
						type="text"
						name="wallet"
						id="wallet"
						class="
							block
							w-full
							pr-10
							border-gray-300
							text-gray-900
							focus:outline-none
							focus:ring-gray-500
							focus:border-gray-500
							sm:text-sm
							rounded-md
						"
						placeholder="Например DOGE"
					/>
				</div>

				<div
					v-if="filteredCoins.length && ticker != ''"
					class="
						flex
						bg-white
						shadow-md
						p-1
						rounded-md
						shadow-md
						flex-wrap
					"
				>
					<span
						v-for="(el, idx) of filteredCoins"
						:key="idx"
						@click="setupTickerName(el)"
						class="
							inline-flex
							items-center
							px-2
							m-1
							rounded-md
							text-xs
							font-medium
							bg-gray-300
							text-gray-800
							cursor-pointer
						"
					>
						{{ el }}
					</span>
				</div>
				<div v-if="added" class="text-sm text-red-600">
					Такой тикер уже добавлен
				</div>
			</div>
		</div>
		<add-button @click="add()" :disabled="disabled" />
	</section>
</template>

<script>
	import AddButton from "./AddButton.vue";
	import { getCoins } from "../api";

	export default {
		components: {
			AddButton,
		},

		props: {
			addedTickers: {
				type: Array,
				required: true,
				default: Array,
			},
			disabled: {
				type: Boolean,
				required: false,
				default: false,
			},
		},

		data: () => ({
			ticker: "",
			coins: [],
			added: false,
			isValid: true,
		}),

		created() {
			this.getCoinsList();
		},

		methods: {
			add() {
				this.isAdded(this.ticker);
				if (!this.added) {
					this.isValidTicker();
					this.$emit("add-ticker", this.ticker, this.isValid);
					this.ticker = "";
				}
			},

			async getCoinsList() {
				const coinsData = await getCoins();
				return (this.coins = Object.keys(coinsData.Data));
			},

			setupTickerName(tickerName) {
				this.ticker = tickerName;
			},

			isValidTicker() {
				this.isValid = this.coins.includes(this.ticker.toUpperCase());
			},

			isAdded(tickerName) {
				this.addedTickers.map((t) => {
					if (t.name.toLowerCase() === tickerName.toLowerCase()) {
						this.added = true;
					}
				});
			},
		},

		computed: {
			filterCoins() {
				return this.coins.filter((coin) =>
					coin.includes(this.ticker.toUpperCase())
				);
			},

			filteredCoins() {
				if (this.filterCoins.length >= 4) {
					return this.filterCoins.slice(1, 5);
				} else {
					return this.filterCoins;
				}
			},
		},
		watch: {
			ticker() {
				this.added = false;
			},
		},
	};
</script>
