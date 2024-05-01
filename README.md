# CustomEnchanted Class for Minecraft Bedrock Edition
The CustomEnchanted class is a TypeScript and JavaScript class that provides utilities for managing custom enchanted items in a Minecraft Bedrock server. It allows users to create, apply, retrieve, and remove custom enchantments from items.

* Updated: 2024-04-29
* Min Version: 1.20.80

## Installation
To use the CustomEnchanted class, you need to have the Minecraft server API `@minecraft/server` installed in your project. If you haven't installed it yet, you can add it to your project using git:

```shell
gh repo clone MrMaxing/custom-enchanted-bedrock
```
```shell
gh repo clone MrMaxing/dynamic-properties-bedrock
```
**Note:** The `custom-enchanted-bedrock` module is required to use the `dynamic-properties-bedrock` class and don't forget to fix path to import `dynamic-properties-bedrock` class.

## Usage
The CustomEnchanted class provides several methods and properties that can be used to create, apply, retrieve, and remove custom enchantments from items.

### Interfaces

#### `EnchantedData` Interface
```typescript
export interface EnchantedData {
    name: string;
    maxLevel: number;
    permisions: string[];
    cooldown?: number;
    incompatible?: string[];
}
```

#### `EnchantedItem` Interface
```typescript
interface EnchantedItem {
    name: string;
    level: number;
}
```

#### `EnchantedCooldown` Interface
```typescript
interface EnchantedCooldown = {
    name: string;
    timer: number;
}
```

### Constructor

The class constructor initializes a new instance of CustomEnchanted. It takes an array of EnchantedData objects as a parameter, representing the initial set of custom enchantments available in the server. These enchantments are stored in the `enchanteds` property of the class.

```typescript
constructor(enchanteds: EnchantedData[], notify?: (player: mc.Player, cooldowns: EnchantedCooldown[]) => void)
```

### Properties

#### `enchanteds` Property

* Type: `EnchantedData[]`
* Description: An array containing information about the available custom enchantments.

#### `notify` Property

* Type: `(player: mc.Player, cooldowns: EnchantedCooldown[]) => void`
* Description: An optional callback function that notifies players about cooldowns on custom enchantments.

### Methods

#### `on` Method

```typescript
public on(name: string, item: mc.ItemStack, player: mc.Player, effect: (level: number) => void, set?: (item: mc.ItemStack) => void): void
```

* Description: Attaches an event listener to listen for custom enchantment triggers.
* Parameters:
  * `name` (string): The name of the custom enchantment.
  * `item` (mc.ItemStack): The item associated with the event.
  * `player` (mc.Player): The player triggering the event.
  * `effect` ((level: number) => void): The effect to execute when the event is triggered.
  * `set` ((item: mc.ItemStack) => void): Optional function to set the item after applying the enchantment.
* Returns: Void

#### `set` Method

```typescript
public set(item: mc.ItemStack, enchanted: EnchantedItem): mc.ItemStack
```

* Description: Applies a custom enchantment to a given item.
* Parameters:
  * `item` (mc.ItemStack): The item to apply the enchantment to.
  * `enchanted` (EnchantedItem): The custom enchantment to apply.
* Returns: The modified item with the custom enchantment applied.

#### `get` Method

```typescript
public get(item: mc.ItemStack): EnchantedItem[]
```

* Description: Retrieves all custom enchantments applied to a given item.
* Parameters:
  * `item` (mc.ItemStack): The item to retrieve enchantments from.
* Returns: An array of custom enchantments applied to the item.

#### `remove` Method

```typescript
public remove(name: string, item: mc.ItemStack): mc.ItemStack
```

* Description: Removes a specific custom enchantment from a given item.
* Parameters:
  * `name` (string): The name of the custom enchantment to remove.
  * `item` (mc.ItemStack): The item to remove the enchantment from.
* Returns: The modified item with the custom enchantment removed.

#### `clear` Method

```typescript
public clear(item: mc.ItemStack): mc.ItemStack
```

* Description: Removes all custom enchantments from a given item.
* Parameters:
  * `item` (mc.ItemStack): The item to remove all enchantments from.
* Returns: The modified item with all custom enchantments removed.

## Example
```ts
import { CustomEnchanted } from "custom-enchanted-bedrock";

export const enchanted = new CustomEnchanted([
  { name: "speed", maxLevel: 5, permisions: [
    "minecraft:netherite_sword",
    "minecraft:diamond_sword",
    "minecraft:golden_sword",
    "minecraft:iron_sword",
    "minecraft:stone_sword",
    "minecraft:wooden_sword",
  ], cooldown: 10 },
  ], (player, cooldowns) => {
    player.onScreenDisplay.setActionBar(cooldowns.map(v => `${v.name} cooldown ${v.timer}s`).join("\n"))
})

mc.world.afterEvents.entityHitEntity.subscribe((event) => {
  // ...code
  const container = player.getComponent("inventory").container;
  const item = container.getItem(player.selectedSlot);
  if (!item) return;

  enchanted.on("speed", item, player, (level) => {
    // ...code
  }, (item) => {
    container.setItem(player.selectedSlot, item);
  })
})
```

## License
This code is open-source and available under the Apache-2.0 license.

Feel free to use and modify it according to your needs. If you have any questions or encounter issues, please create an issue on the GitHub repository or contact the author for support.