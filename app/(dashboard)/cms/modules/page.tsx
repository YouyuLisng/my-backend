// app/admin/modules/page.tsx
import { getModules } from "./actions/module";
import { ModuleDataTable } from "./components/ModuleTable";

export default async function ModulePage() {
    const { success, data } = await getModules();
    const modules = success && data ? data : [];

    return (
        <div className="container mx-auto py-8">
            <ModuleDataTable data={modules} />
        </div>
    );
}