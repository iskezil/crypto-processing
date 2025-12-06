import type { IconButtonProps } from '@mui/material/IconButton';
import IconButton from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';

import { FlagIcon } from 'src/components/flag-icon';
import { CustomPopover } from 'src/components/custom-popover';
import { transitionTap, varHover, varTap } from 'src/components/animate';
import { router, usePage } from '@inertiajs/react';
import type { PageProps } from '@inertiajs/core';
// ----------------------------------------------------------------------

export type LanguagePopoverProps = IconButtonProps & {
  data?: {
    value: string;
    label: string;
    countryCode: string;
  }[];
};

export function LanguagePopover({ data = [], sx, ...other }: LanguagePopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();
  const { props } = usePage<PageProps>();
  const { locale, csrf_token } = props;

  const handleChangeLang = useCallback(
    (newLang: string) => {
      try {
        router.patch<{ _token: string; language: string }>(route('locale.update'), {
          _token: csrf_token,
          language: newLang,
        });
      } catch (error) {
        console.error('Logout failed', error);
      }
      onClose();
    },
    [onClose]
  );

  const renderMenuList = () => (
    <CustomPopover open={open} anchorEl={anchorEl} onClose={onClose}>
      <MenuList sx={{ width: 160, minHeight: 72 }}>
        {data?.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === locale}
            onClick={() => handleChangeLang(option.value)}
          >
            <FlagIcon code={option.countryCode} />
            {option.label}
          </MenuItem>
        ))}
      </MenuList>
    </CustomPopover>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Languages button"
        onClick={onOpen}
        sx={[
          (theme) => ({
            p: 0,
            width: 40,
            height: 40,
            ...(open && { bgcolor: theme.vars.palette.action.selected }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <FlagIcon code={locale} />
      </IconButton>

      {renderMenuList()}
    </>
  );
}
