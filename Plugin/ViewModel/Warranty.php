<?php

namespace Swissup\BreezeExtendPurchasePriceOffers\Plugin\ViewModel;

use Extend\Warranty\Model\Config\Source\ProductPagePlacement;
use Extend\Warranty\ViewModel\Warranty as Subject;
use Magento\Framework\ObjectManagerInterface;
use Swissup\Breeze\Helper\Data as BreezeHelper;

class Warranty
{
    private BreezeHelper $breezeHelper;
    private ObjectManagerInterface $objectManager;

    public function __construct(
        BreezeHelper $breezeHelper,
        ObjectManagerInterface $objectManager
    ) {
        $this->breezeHelper = $breezeHelper;
        $this->objectManager = $objectManager;
    }

    public function afterGetProductDetailPageOffersPlacement(
        Subject $subject,
        array $result,
        bool $isSimpleProduct
    ): array {

        if ($this->breezeHelper->isEnabled()) {
            $dataHelper = $this->objectManager->get('\Extend\Warranty\Helper\Api\Data');
            $pdpDisplay = $dataHelper->getProductDetailPageOffersPlacement();

            switch ($pdpDisplay) {
                case ProductPagePlacement::ACTIONS_BEFORE:
                case ProductPagePlacement::ACTIONS_AFTER:
                    $result['insertionPoint'] = '.product-add-form.cloned div.actions';
                    break;
            }
        }

        return $result;
    }
}
