'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { formatEuro, pricingPlans, type PricingPlan } from '@/lib/pricing'

function PlanCard({ plan, yearly }: { plan: PricingPlan; yearly: boolean }) {
  const monthlyDisplay = yearly ? plan.yearlyMonthlyEffective : plan.monthlyPrice

  return (
    <Card
      className={cn(
        'flex h-full flex-col',
        plan.recommended && 'border-zinc-900 shadow-md ring-1 ring-zinc-900',
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          {plan.recommended ? (
            <Badge className="bg-zinc-900 text-white hover:bg-zinc-900">Empfehlung</Badge>
          ) : null}
        </div>
        <CardDescription className="leading-6">{plan.tagline}</CardDescription>

        <div className="pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold tracking-tight text-zinc-950">
              {formatEuro(monthlyDisplay)}
            </span>
            <span className="text-sm text-zinc-500">/ Monat</span>
          </div>
          {yearly ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-zinc-500">
                jährlich abgerechnet · {formatEuro(plan.yearlyPrice)}
              </span>
              <Badge
                variant="outline"
                className="border-emerald-300 bg-emerald-50 text-emerald-700"
              >
                {plan.yearlyDiscountNote}
              </Badge>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">monatlich abgerechnet</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-700">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <span className="leading-6">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="w-full"
          variant={plan.recommended ? 'default' : 'outline'}
        >
          <Link href={plan.cta.href}>
            {plan.cta.label}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function PricingPlans() {
  // Standard: Jährlich, damit der Rabatt sofort sichtbar ist.
  const [yearly, setYearly] = useState(true)
  const switchId = useId()

  return (
    <div className="space-y-8">
      <div
        className="flex flex-wrap items-center justify-center gap-3"
        role="group"
        aria-label="Abrechnungszeitraum wählen"
      >
        <span
          className={cn(
            'text-sm font-medium',
            yearly ? 'text-zinc-500' : 'text-zinc-950',
          )}
        >
          Monatlich
        </span>
        <Switch
          id={switchId}
          checked={yearly}
          onCheckedChange={setYearly}
          aria-label="Zwischen monatlicher und jährlicher Abrechnung umschalten"
        />
        <label htmlFor={switchId} className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              yearly ? 'text-zinc-950' : 'text-zinc-500',
            )}
          >
            Jährlich
          </span>
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
            2 Monate gratis
          </Badge>
        </label>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {pricingPlans.map((plan) => (
          <PlanCard key={plan.key} plan={plan} yearly={yearly} />
        ))}
      </div>
    </div>
  )
}
