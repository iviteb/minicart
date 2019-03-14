import React from 'react'
import * as reactTestingLibrary from 'react-testing-library'
import { IntlProvider } from 'react-intl'
import defaultStrings from '../../messages/en.json'

export const render = (node, options) => {
  const rendered = reactTestingLibrary.render(
    <IntlProvider messages={defaultStrings} locale="en-US">
      {node}
    </IntlProvider>,
    options
  )

  return {
    ...rendered,
    rerender: newUi =>
      customRender(newUi, {
        container: rendered.container,
        baseElement: rendered.baseElement,
      }),
  }
}

export default reactTestingLibrary