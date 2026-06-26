import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { obterIniciais, USER_ROLE_LABEL } from "@/lib/utils/format";
import type { Profile } from "@/types/database";

export function PerfilCard({ profile }: { profile: Profile }) {
  return (
    <Card className="card-premium">
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar className="h-14 w-14 border-2 border-pib-gold-400/40">
          <AvatarFallback className="text-base">{obterIniciais(profile.nome_completo)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{profile.nome_completo}</p>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge variant="gold">{USER_ROLE_LABEL[profile.role]}</Badge>
            {profile.cargo_ministerial && <Badge variant="secondary">{profile.cargo_ministerial}</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
