export interface EmployeeCompProfile {
  pay_type?: 'salary' | 'percentage' | 'mixed' | null
  pay_percentage?: number | null
  base_salary?: number | null
}

export function computeServiceEarnings(
  totalAmount: number,
  profile?: EmployeeCompProfile | null,
  fallbackPercentage?: number | null
): { percentage: number; earnings: number } {
  const payType = profile?.pay_type ?? 'percentage'

  if (payType === 'salary') {
    return { percentage: 0, earnings: 0 }
  }

  const configuredPercentage = Number(profile?.pay_percentage ?? fallbackPercentage ?? 0)
  const normalizedPercentage = Math.max(0, configuredPercentage)

  return {
    percentage: normalizedPercentage,
    earnings: totalAmount * (normalizedPercentage / 100),
  }
}
