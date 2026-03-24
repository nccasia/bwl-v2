import { Locale } from '@/enums/locale';
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  const cookiesStore = await cookies();
  let locale = cookiesStore.get('locale')?.value || Locale.EN;

  if (!Object.values(Locale).includes(locale as Locale)) {
    locale = Locale.EN;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});