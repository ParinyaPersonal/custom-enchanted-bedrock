import * as mc from "@minecraft/server"
import DynamicProperties from "../dynamic-properties-bedrock/index";

export type Enchanted = {
    name: string;
    level: number;
}

export type EnchantedBase = {
    name: string;
    maxLevel: number;
    incompatible?: string[];
}

export default class CustomEnchanted {

    /**
     * @private
     * @type {DynamicProperties<EnchantedBase>} - enchanteds database
     */
    private db: DynamicProperties<EnchantedBase>

    /**
     * @param {EnchantedBase[]} enchanted - config of enchanteds
     */
    constructor(enchanted: EnchantedBase[])

    /**
     * @param {string} name - name of enchanteds
     * @param {mc.Player} player - player
     * @param {(level: number, item: mc.ItemStack) => void} callback - callback
     * @param {{duration: number, notify?: (timer: number) => void}} [cooldown] - cooldown
     */
    public on(name: string, player: mc.Player, callback: (level: number, item: mc.ItemStack) => void, cooldown?: { duration: number, notify?: (timer: number) => void }): void

    /**
     * @private
     * @static
     * @type {DynamicProperties<EnchantedBase>} - enchanteds database
     */
    private static db: DynamicProperties<EnchantedBase>

    /**
     * @param {string} name - name of enchanteds
     * @returns {number} max level
     */
    public static max(name: string): number

    /**
     * @param {string} name - name of enchanteds
     * @param {mc.ItemStack} item - item
     * @returns {boolean} incompatible
     */
    public static incompatible(name: string, item: mc.ItemStack): boolean

    /**
     * @param {Enchanted} enchanted - enchanted
     * @param {mc.ItemStack} item - item 
     * @returns {mc.ItemStack} item
     */
    public static set(enchanted: Enchanted, item: mc.ItemStack): mc.ItemStack

    /**
     * @param {mc.ItemStack} item - item
     * @returns {Enchanted[]} enchanteds
     */
    public static get(item: mc.ItemStack): Enchanted[]

    /**
     * @param {string} name - name of enchanteds
     * @param {mc.ItemStack} item - item
     * @returns {mc.ItemStack} item
     */
    public static remove(name: string, item: mc.ItemStack): mc.ItemStack
}