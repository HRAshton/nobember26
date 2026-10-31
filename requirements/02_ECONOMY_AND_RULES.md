# Economy and invariants

| Parameter | Value |
|---|---:|
| Key price | 100 gems |
| Each main code | 100 gems |
| Final code | 10 gems |
| Exchange rate | 1 silver to 1 gem |
| One silver | 100 copper |
| Total sellable junk from regular chests | 90 silver, or 9000 copper |
| Each ordinary opening | 1 key, 4 rewards |
| Initial gems, coins, keys | 0 |
| Initial ordinary chests | N = gifts.length |
| Hidden extra chests | 1 |

Earlier examples using nine gold or one gold for ten gems were superseded by the values above.

With k main codes redeemed, junk alone brings total income to at most 100*k + 90 gems, below the next key price of 100*(k+1). The final code adds the missing 10. A completed natural run therefore funds exactly N+1 keys for N+1 chests and ends with zero currency after all exchanges.

Main codes are not ordered in software. Knowing several codes early may fund several ordinary keys; physical placement controls progression. This does not create extra income.

All arithmetic uses integer copper. Exchange must never round up. Junk is allocated deterministically across chests and always totals 9000 copper; the current engine uses repeating weights 2, 3, and 4 with integer remainder distribution. A decorative item must never add sellable value outside that budget.

Merchant sales remove the item and credit its exact value. Buyback debits that exact value and returns it. Repeated sale and buyback cannot generate profit. No action may create a negative balance, redeem a code twice, or duplicate rewards after reload.

## Natural progression

1. Redeem the starting code, buy a key, open the first chest.
2. Read journal i to find gift i and, for i less than N, its next code.
3. Sell junk and exchange the proceeds manually.
4. After all ordinary chests, 90 gems from junk plus the final 10 fund the last key.
5. The hidden extra chest appears and contains the final journal.

For five gifts, one illustrative junk split is 10s, 15s, 20s, 20s, 25s. Accumulated income after buying each ordinary key is 10, 25, 45, 65, then 90 gems. The secret code and final key purchase bring it back to zero. Only the total is required; this example is not the engine's fixed split.

Check bonus eligibility after key purchases and ordinary openings: all main chests open, final code redeemed, at least one unused key, bonus not yet granted. This supports early code redemption and spare keys without revealing the bonus prematurely.

Reject opening without a key, purchasing with too few gems, exchanging without enough coins, and buying back without the sale value. An early final code cannot expose the chest before main completion. Refreshing during an animation cannot duplicate books, junk, or chest rewards.
