import DynamicProperties from "../dynamic-properties-bedrock/index";
export class CustomEnchanted {
    enchanteds;
    notify;
    constructor(enchanteds, notify) {
        this.enchanteds = enchanteds.map(v => ({ ...v, name: ToolsEnchanted.name(v.name, false) }));
        this.notify = notify;
    }
    db(item) {
        return new DynamicProperties("cooldown", item);
    }
    ;
    async on(name, item, player, effect, set) {
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
            const want = new Date(this.db(item).get(fix));
            const diff = Math.abs(new Date().getTime() - want.getTime());
            if (Math.ceil(diff / 1000) > cooldown + level) {
                this.db(item).set(fix, new Date().toString());
                set(item);
                effect(level);
            }
            else if (this.notify) {
                this.notify(player, enchanteds.map(v => {
                    const want = new Date(this.db(item).get(v.name));
                    const diff = Math.abs(new Date().getTime() - want.getTime());
                    return {
                        name: v.name,
                        timer: (cooldown + level) - Math.ceil(diff / 1000)
                    };
                }).filter(v => v.timer > 0));
            }
        }
        else
            effect(level);
    }
    set(item, enchanted) {
        const fix = ToolsEnchanted.name(enchanted.name, false);
        const { permisions, incompatible } = this.enchanteds.find(e => e.name === fix);
        if (enchanted.level <= 0)
            throw new Error("Level must be greater than 0");
        if (permisions.length > 0)
            if (!permisions.some(v => v === item.typeId))
                throw new Error(`Item ${item.typeId} is not allowed`);
        if (!this.enchanteds.some(e => e.name === fix))
            throw new Error(`Enchanted ${fix} is not allowed`);
        if (this.enchanteds.find(e => e.name === fix).maxLevel < enchanted.level)
            throw new Error(`Enchanted ${fix} has reached its maximum level (${this.enchanteds.find(e => e.name === fix).maxLevel})`);
        if (incompatible?.length > 0)
            if (incompatible?.some(i => i === fix))
                throw new Error(`Enchanted ${fix} is incompatible`);
        if (this.get(item).some(v => v.name === fix)) {
            const enchanteds = this.get(item);
            const index = enchanteds.findIndex(v => v.name === fix);
            enchanteds[index].level = enchanted.level;
            item.setLore([
                "§rCustom Enchanted",
                ...enchanteds.map(v => `§r§7${v.name} ${ToolsEnchanted.roman(v.level)}`)
            ]);
            return item;
        }
        else {
            item.setLore([
                "§rCustom Enchanted",
                ...this.get(item).map(v => `§r§7${v.name} ${ToolsEnchanted.roman(v.level)}`),
                `§r§7${fix} ${ToolsEnchanted.roman(enchanted.level)}`
            ]);
            return item;
        }
    }
    get(item) {
        if (item.getLore().length === 0)
            return [];
        const array = item.getLore().filter(v => v !== "§rCustom Enchanted");
        const enchanteds = array.map(enchanted => {
            const divide = enchanted.split(" ");
            const name = divide.splice(0, divide.length - 1).join(" ");
            const level = divide[divide.length - 1];
            return { name: name.slice(4, name.length), level: ToolsEnchanted.arabic(level) };
        });
        return enchanteds;
    }
    remove(name, item) {
        const fix = ToolsEnchanted.name(name, false);
        const array = item.getLore().filter(v => v !== "§rCustom Enchanted");
        const enchanteds = array.filter(s => !s.includes(fix));
        const lore = [
            "§rCustom Enchanted",
            ...enchanteds
        ];
        item.setLore(enchanteds.length > 0 ? lore : undefined);
        return item;
    }
    clear(item) {
        return item.setLore(undefined);
    }
}
class ToolsEnchanted {
    static roman(num) {
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
    static arabic(roman) {
        const map = {
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
            }
            else {
                result += value;
            }
            prevValue = value;
        }
        return result;
    }
    static name(text, isTypeId = true) {
        if (isTypeId) {
            const base = text.split(":")[1].split("_");
            return base.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        }
        else {
            return text.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        }
    }
}
