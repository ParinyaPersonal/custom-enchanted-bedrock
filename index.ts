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

    private db: DynamicProperties<EnchantedBase> = new DynamicProperties<EnchantedBase>("enchanteds");

    constructor(enchanted: EnchantedBase[]) {
        this.db.clear();
        enchanted.forEach(({ name, maxLevel, incompatible }) => {
            const fix = name.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
            this.db.set(this.db.hex(5), {
                name: fix,
                maxLevel,
                incompatible
            });
        });
    }

    public on(name: string, player: mc.Player, callback: (level: number, item: mc.ItemStack) => void, cooldown?: { duration: number, notify?: (timer: number) => void }) {
        const container = player.getComponent("inventory").container;
        const item = container.getItem(player.selectedSlot);
        const fix = name.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
        if (!this.db.array.some(v => v[1].name === fix))
            return CustomEnchanted.remove(fix, item);
        const enchanteds = CustomEnchanted.get(item);
        if (enchanteds.some(v => v.name === fix)) {
            const level = enchanteds.find(v => v.name === fix).level;
            if (cooldown) {
                if (!item.getDynamicProperty("cooldown"))
                    item.setDynamicProperty("cooldown", new Date().toString());
                const want = new Date(item.getDynamicProperty("cooldown") as string);
                const diff = Math.abs(new Date().getTime() - want.getTime());
                const timer = (cooldown.duration + level) - Math.ceil(diff / 1000)
                if (Math.ceil(diff / 1000) < cooldown.duration + level)
                    cooldown.notify(timer);
                else {
                    item.setDynamicProperty("cooldown", new Date().toString());
                    callback(level, item);
                    container.setItem(player.selectedSlot, item);
                }
            } else
                callback(level, item);
        }
    }

    private static db: DynamicProperties<EnchantedBase> = new DynamicProperties<EnchantedBase>("enchanteds");

    public static max(name: string): number {
        const fix = name.charAt(0).toUpperCase() + name.slice(1);
        const enchanteds = this.db.array.find(v => v[1].name === fix);
        if (!enchanteds)
            return 0;
        return enchanteds[1].maxLevel
    }

    public static incompatible(name: string, item: mc.ItemStack): boolean {
        const fix = name.charAt(0).toUpperCase() + name.slice(1);
        const enchantedsItem = this.get(item);
        const enchanteds = this.db.array.find(v => v[1].name === fix);
        if (!enchanteds[1].incompatible)
            return false;
        return enchanteds[1].incompatible.some(v => enchantedsItem.some(v => v.name === v.name));
    }

    public static set(enchanted: Enchanted, item: mc.ItemStack): mc.ItemStack {
        const fix = enchanted.name.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        if (enchanted.level <= 0)
            console.error("Level must be greater than 0");
        else if (this.incompatible(enchanted.name, item))
            console.error(`${enchanted.name} is incompatible with ${item.typeId}`);
        else if (this.max(fix) < enchanted.level)
            console.error(`${enchanted.name} has reached its maximum level (${this.max(fix)})`);
        else if (this.get(item).some(v => v.name === fix)) {
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

    public static get(item: mc.ItemStack): Enchanted[] {
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

    public static remove(name: string, item: mc.ItemStack): mc.ItemStack {
        const fix = name.charAt(0).toUpperCase() + name.slice(1);
        const array = item.nameTag.split("\n");
        const cut = array.slice(1, array.length);
        const enchanteds = cut.filter(s => !s.includes(fix));
        item.nameTag = [array[0], ...enchanteds].join("\n");
        return item;
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

    public static name(typeId: string) {
        const base = typeId.split(":")[1].split("_");
        return base.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    }
}