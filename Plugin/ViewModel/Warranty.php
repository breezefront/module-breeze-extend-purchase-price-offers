<?php

namespace Swissup\BreezeExtendPurchasePriceOffers\Plugin\ViewModel;

use Extend\Warranty\Helper\Api\Data as DataHelper;
use Extend\Warranty\Model\Config\Source\ProductPagePlacement;
use Extend\Warranty\ViewModel\Warranty as Subject;
use Swissup\Breeze\Helper\Data as BreezeHelper;

class Warranty
{
    private BreezeHelper $breezeHelper;
    private DataHelper $dataHelper;

    public function __construct(
        BreezeHelper $breezeHelper,
        DataHelper $dataHelper
    ) {
        $this->breezeHelper = $breezeHelper;
        $this->dataHelper = $dataHelper;
    }

    public function afterGetProductDetailPageOffersPlacement(
        Subject $subject,
        array $result,
        bool $isSimpleProduct
    ): array {

        if ($this->breezeHelper->isEnabled()) {
            $pdpDisplay = $this->dataHelper->getProductDetailPageOffersPlacement();

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
