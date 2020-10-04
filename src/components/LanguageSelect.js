import FormControl from "@material-ui/core/FormControl";
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";

import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

const languageNames = {
    en: "English",
    ru: "Русский",
    uk: "Українська",
};

const LanguageSelect = ({ value, onChange, locales = ["en", "ru", "uk"] }) => {
    const handleChange = useCallback((e) => onChange?.(e.target.value), [
        onChange,
    ]);

    return (
        <FormControl margin="normal" fullWidth>
            <InputLabel id="language-select-label" shrink>
                <FormattedMessage id="LanguageSelect.label" />
            </InputLabel>
            <Select
                labelId="language-select-label"
                id="language-select"
                value={value}
                onChange={handleChange}
            >
                {locales.map((locale) => (
                    <MenuItem value={locale}>{languageNames[locale]}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default LanguageSelect;
