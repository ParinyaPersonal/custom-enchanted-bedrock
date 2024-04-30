# CustomEnchanted Class for Minecraft Bedrock Edition
The CustomEnchanted class is a TypeScript and JavaScript class that provides utilities for managing custom enchanted items in a Minecraft Bedrock server. It allows users to create, apply, retrieve, and remove custom enchantments from items.

* Updated: 2024-04-29
* Min Version: 1.20.80

## Installation
To use the CustomEnchanted class, you need to have the Minecraft server API `@minecraft/server` installed in your project. If you haven't installed it yet, you can add it to your project using git:

```shell
gh repo clone MrMaxing/custom-enchanted-bedrock
```
**Note:** Need to import `dynamic-properties-bedrock` module to use with this.
```shell
gh repo clone MrMaxing/dynamic-properties-bedrock
```

## Types and Interfaces
### `EnchantedBase` Type
```typescript
type EnchantedBase = {
    name: string;
    maxLevel: number;
    incompatible?: string[];
}
```

### `Enchanted` Type
```typescript
type Enchanted = {
    name: string;
    level: number;
}
```

## Methods
You can use the CustomEnchanted class to create and manage items with the following methods:

### Constructor
```typescript
public constructor(enchanted: EnchantedBase[]): void
```

### `on` Method

```typescript
public on(name: string, player: mc.Player, callback: (level: number, item: mc.ItemStack) => void, cooldown?: { duration: number, notify?: (timer: number) => void }): void
```

* Description: Attaches an event handler to listen for custom enchantment triggers.
* Parameters:
  * `name` (string): The name of the custom enchantment.
  * `player` (mc.Player): The player triggering the event.
  * `callback` ((level: number, item: mc.ItemStack) => void): The callback function to execute when the event is triggered.
  * `cooldown` ({ duration: number, notify?: (timer: number) => void }): Optional object specifying cooldown duration and notification callback.
* Returns: Void

### `max` Method

```typescript
public static max(name: string): number
```

* Description: Retrieves the maximum level of a custom enchantment.
* Parameters:
  * `name` (string): The name of the custom enchantment.
* Returns: The maximum level of the custom enchantment.

### `incompatible` Method

```typescript
public static incompatible(name: string, item: mc.ItemStack): boolean
```

* Description: Checks if a custom enchantment is incompatible with an item.
* Parameters:
  * `name` (string): The name of the custom enchantment.
  * `item` (mc.ItemStack): The item to check compatibility with.
* Returns: True if the custom enchantment is incompatible with the item, otherwise false.

### `set` Method

```typescript
public static set(enchanted: Enchanted, item: mc.ItemStack): mc.ItemStack
```

* Description: Applies a custom enchantment to an item.
* Parameters:
  * `enchanted` (Enchanted): The custom enchantment to apply.
  * `item` (mc.ItemStack): The item to apply the enchantment to.
* Returns: The modified item with the custom enchantment applied.

### `get` Method

```typescript
public static get(item: mc.ItemStack): Enchanted[]
```

* Description: Retrieves all custom enchantments applied to an item.
* Parameters:
  * `item` (mc.ItemStack): The item to retrieve enchantments from.
* Returns: An array of custom enchantments applied to the item.

### `remove` Method

```typescript
public static remove(name: string, item: mc.ItemStack): mc.ItemStack
```

* Description: Removes a custom enchantment from an item.
* Parameters:
  * `name` (string): The name of the custom enchantment to remove.
  * `item` (mc.ItemStack): The item to remove the enchantment from.
* Returns: The modified item with the custom enchantment removed.

## License
This code is open-source and available under the MIT License.

Feel free to use and modify it according to your needs. If you have any questions or encounter issues, please create an issue on the GitHub repository or contact the author for support.
