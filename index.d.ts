import * as mc from "@minecraft/server";
import DynamicProperties from "../dynamic-properties-bedrock/index";

export interface EnchantedData {
    name: string;
    maxLevel: number;
    permisions: string[];
    cooldown?: number;
    incompatible?: string[];
}

export interface EnchantedItem {
    name: string;
    level: number;
}

export interface EnchantedCooldown {
    name: string;
    timer: number;
}

export class CustomEnchanted {

    /**
     * @type {EnchantedData[]} - An array of EnchantedData objects.
     */
    public enchanteds: EnchantedData[];

    /**
     * @type {(player: mc.Player, cooldowns: EnchantedCooldown[]) => void} - A function that will be called when the cooldown expires.
     */
    public notify?: (player: mc.Player, cooldowns: EnchantedCooldown[]) => void

    /**
     * @param {EnchantedData[]} enchanteds - An array of EnchantedData objects.
     * @param {(player: mc.Player, cooldowns: EnchantedCooldown[]) => void} notify - A function that will be called when the cooldown expires.
     */
    constructor(enchanteds: EnchantedData[], notify?: (player: mc.Player, cooldowns: EnchantedCooldown[]) => void)

    /**
     * @param {mc.ItemStack} item - The item stack to get the cooldown from.
     * @returns {DynamicProperties<string>} - The cooldown for the item.
     */
    private db(item: mc.ItemStack): DynamicProperties<string>

    /**
     * @param {string} name - The name of the enchantment.
     * @param {mc.ItemStack} item - The item stack to add the enchantment to.
     * @param {mc.Player} player - The player who is adding the enchantment.
     * @param {(level: number) => void} effect - The effect of the enchantment.
     * @param {(item: mc.ItemStack) => void} set - The function to set the item stack.
     * @returns {void} - Events will be triggered.
     */
    public on(name: string, item: mc.ItemStack, player: mc.Player, effect: (level: number) => void, set?: (item: mc.ItemStack) => void): void

    /**
     * @param {mc.ItemStack} item - The item stack to add the enchantment to.
     * @param {EnchantedItem} enchanted - The enchanted item to add.
     * @returns {mc.ItemStack} - The item stack with the enchantment added.
     */
    public set(item: mc.ItemStack, enchanted: EnchantedItem): mc.ItemStack

    /**
     * @param {mc.ItemStack} item - The item stack to remove the enchantment from.
     * @returns {mc.ItemStack} - The item stack with the enchantment removed.
     */
    public get(item: mc.ItemStack): EnchantedItem[]

    /**
     * @param {string} name - The name of the enchantment.
     * @param {mc.ItemStack} item - The item stack to remove the enchantment from.
     * @returns {mc.ItemStack} - The item stack with the enchantment removed.
     */
    public remove(name: string, item: mc.ItemStack): mc.ItemStack

    /**
     * @param {mc.ItemStack} item - The item stack to remove the enchantment from.
     * @returns {void} - The item stack with the enchantment cleared.
     */
    public clear(item: mc.ItemStack): void
}