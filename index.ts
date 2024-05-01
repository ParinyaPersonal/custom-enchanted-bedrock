import * as mc from "@minecraft/server";
import DynamicProperties from "../custom-enchanted-bedrock/index";

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

    public enchanteds: EnchantedData[];

    public notify?: (player: mc.Player, cooldowns: EnchantedCooldown[]) => void

    constructor(enchanteds: EnchantedData[], notify?: (player: mc.Player, cooldowns: EnchantedCooldown[]) => void) {
        this.enchanteds = enchanteds.map(v => ({ ...v, name: ToolsEnchanted.name(v.name, false) }));
        this.notify = notify;
    }

    private db(item: mc.ItemStack) {
        return new DynamicProperties<string>("cooldown", item);
    };

    public async on(name: string, item: mc.ItemStack, player: mc.Player, effect: (level: number) => void, set?: (item: mc.ItemStack) => void) {
        const fix = ToolsEnchanted.name(name, false);
        if (this.get(item).length === 0)
            return;
        if (!this.enchanteds.some(e => e.name === fix))
            throw new Error(`Enchanted ${fix} is not allowed`);
        if (!this.get(item).some(v => v.name === fix))
            return;
        const enchanteds = this.get(item);
        const level = enchanteds.find(v => v.name === fix).level;
        const cooldown = this.enchanteds.find(v => v.name === fix).cooldown;
        if (cooldown) {
            if (!this.db(item).has(fix)) {
                this.db(item).set(fix, new Date().toString());
                set(item);
            }
            const want = new Date(this.db(item).get(fix) as string);
            const diff = Math.abs(new Date().getTime() - want.getTime());
            if (Math.ceil(diff / 1000) > cooldown + level) {
                this.db(item).set(fix, new Date().toString());
                set(item);
                effect(level);
            } else if (this.notify) {
                this.notify(player, enchanteds.map(v => {
                    const want = new Date(this.db(item).get(v.name) as string);
                    const diff = Math.abs(new Date().getTime() - want.getTime());
                    return {
                        name: v.name,
                        timer: (cooldown + level) - Math.ceil(diff / 1000)
                    }
                }).filter(v => v.timer > 0))
            }
        } else
            effect(level);
    }

    public set(item: mc.ItemStack, enchanted: EnchantedItem) {
        const fix = ToolsEnchanted.name(enchanted.name, false);
        const { permisions, incompatible } = this.enchanteds.find(e => e.name === fix)
        if (enchanted.level <= 0)
            throw new Error("Level must be greater than 0");
        if (permisions.length > 0)
            if (!permisions.some(v => v === item.typeId))
                throw new Error(`Item ${item.typeId} is not allowed`)
        if (!this.enchanteds.some(e => e.name === fix))
            throw new Error(`Enchanted ${fix} is not allowed`)
        if (this.enchanteds.find(e => e.name === fix).maxLevel < enchanted.level)
            throw new Error(`Enchanted ${fix} has reached its maximum level (${this.enchanteds.find(e => e.name === fix).maxLevel})`)
        if (incompatible?.length > 0)
            if (incompatible?.some(i => i === fix))
                throw new Error(`Enchanted ${fix} is incompatible`)
        if (this.get(item).some(v => v.name === fix)) {
            const enchanteds = this.get(item);
            const index = enchanteds.findIndex(v => v.name === fix);
            enchanteds[index].level = enchanted.level;
            const nameTag = item.nameTag.split("\n")[0];
            item.nameTag = [
                `§r§b${nameTag ?? ToolsEnchanted.name(item.typeId)}`,
                ...enchanteds.map(v => `§r§7${v.name} ${ToolsEnchanted.roman(v.level)}`)
            ].join("\n");
            return item;
        } else {
            item.nameTag = [
                `§r§b${item.nameTag ?? ToolsEnchanted.name(item.typeId)}`,
                `§r§7${fix} ${ToolsEnchanted.roman(enchanted.level)}`
            ].join("\n");
            return item;
        }
    }

    public get(item: mc.ItemStack) {
        if (!item.nameTag)
            return [];
        const array = item.nameTag.split("\n");
        const cut = array.slice(1, array.length);
        const enchanteds = cut.map(enchanted => {
            const divide = enchanted.split(" ");
            const name = divide.splice(0, divide.length - 1).join(" ");
            const level = divide[divide.length - 1];
            return { name: name.slice(4, name.length), level: ToolsEnchanted.arabic(level) };
        });
        return enchanteds;
    }

    public remove(name: string, item: mc.ItemStack): mc.ItemStack {
        const fix = ToolsEnchanted.name(name, false);
        const array = item.nameTag.split("\n");
        const cut = array.slice(1, array.length);
        const enchanteds = cut.filter(s => !s.includes(fix));
        item.nameTag = [array[0], ...enchanteds].join("\n");
        return item;
    }
    
    public clear(item: mc.ItemStack) {
        return item.setLore([]);
    }
}

class ToolsEnchanted {
    public static roman(num: number): string {
        const key = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "M", "MM", "MMM"];
        let roman = "";
        let i = 0;
        while (num > 0) {
            roman = key[(num % 10) + i * 10] + roman;
            num = Math.floor(num / 10);
            i++;
        }
        return roman;
    }

    public static arabic(roman: string): number {
        const map: { [key: string]: number } = {
            "I": 1,
            "V": 5,
            "X": 10,
            "L": 50,
            "C": 100,
            "D": 500,
            "M": 1000
        };

        let result = 0;
        let prevValue = 0;

        for (let i = roman.length - 1; i >= 0; i--) {
            const value = map[roman[i]];
            if (value < prevValue) {
                result -= value;
            } else {
                result += value;
            }
            prevValue = value;
        }

        return result;
    }

    public static name(text: string, isTypeId = true) {
        if (isTypeId) {
            const base = text.split(":")[1].split("_");
            return base.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        } else {
            return text.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
        }
    }
}