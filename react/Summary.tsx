import React, { FC, useEffect, useMemo, useState } from 'react'
import { ExtensionPoint } from 'vtex.render-runtime'
import { OrderForm as OrderFormComponent } from 'vtex.order-manager'
import { useCssHandles, CssHandlesTypes } from 'vtex.css-handles'

import { fetchWithRetry } from './legacy/utils/fetchWithRetry'
import { PackagesSkuIds } from './typings/packages-sku-ids'

const CSS_HANDLES = ['minicartSummary'] as const

interface Props {
  classes?: CssHandlesTypes.CustomClasses<typeof CSS_HANDLES>
}

const Summary: FC<Props> = ({ classes }) => {
  const { useOrderForm } = OrderFormComponent

  const {
    orderForm: { totalizers, value, items, paymentData },
  } = useOrderForm()

  const [packagesSkuIds, setPackagesSkuIds] = useState<string[]>([])

  useEffect(() => {
    let isSubscribed = true

    fetchWithRetry('/_v/private/api/cart-bags-manager/app-settings', 3).then(
      (res: PackagesSkuIds) => {
        if (res && isSubscribed) {
          try {
            setPackagesSkuIds(Object.values(res.data))
          } catch (error) {
            console.error('Error in packages feature.', error)
          }
        }
      }
    )

    return () => {
      isSubscribed = false
    }
  }, [])

  const flegValue = useMemo(() => {
    if (!packagesSkuIds.length) {
      return
    }
    return items.reduce((total: number, item: OrderFormItem) => {
      if (packagesSkuIds.includes(item.id)) {
        return (
          total + ((item?.listPrice as number) ?? 0) * (item?.quantity ?? 1)
        )
      }
      return total
    }, 0)
  }, [items, packagesSkuIds])

  let newTotalizers = totalizers

  if (flegValue && typeof flegValue === 'number') {
    newTotalizers = JSON.parse(JSON.stringify(totalizers))

    const totalizerItems = newTotalizers.find((t: any) => t.id === 'Items')

    newTotalizers.push({
      id: 'Fleg',
      name: 'Taxa ambalare',
      value: flegValue,
      __typename: 'Totalizer',
    })

    totalizerItems.value -= flegValue ?? 0
  }

  const { handles } = useCssHandles(CSS_HANDLES, { classes })

  const originalValue =
    items?.reduce(
      (total: number, item: OrderFormItem) =>
        (total as number) +
        ((item?.listPrice as number) ?? 0) * (item?.quantity ?? 1),
      0
    ) ?? 0

  return (
    <div className={`${handles.minicartSummary} ph4 ph6-l pt5`}>
      <ExtensionPoint
        id="checkout-summary"
        totalizers={newTotalizers}
        paymentData={paymentData}
        total={value}
        originalTotal={originalValue}
      />
    </div>
  )
}

export default Summary
