import { redirect } from 'next/navigation';

export default function NewTagPage() {
  redirect('/admin/articles');
}
